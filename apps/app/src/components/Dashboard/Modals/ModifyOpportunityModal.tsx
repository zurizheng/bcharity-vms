import { ProfileFragment } from '@lens-protocol/client'
import { useStorageUpload } from '@thirdweb-dev/react'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import GradientModal from '@/components/Shared/Modal/GradientModal'
import { FileInput } from '@/components/UI/FileInput'
import { Form } from '@/components/UI/Form'
import { Input } from '@/components/UI/Input'
import { Spinner } from '@/components/UI/Spinner'
import { TextArea } from '@/components/UI/TextArea'
import checkAuth from '@/lib/lens-protocol/checkAuth'
import useCreatePost from '@/lib/lens-protocol/useCreatePost'
import {
  buildMetadata,
  OpportunityMetadataRecord,
  PostTags
} from '@/lib/metadata'
import { MetadataVersion } from '@/lib/types'

import Error from './Error'
import { IPublishOpportunityFormProps } from './PublishOpportunityModal'

interface IPublishOpportunityModalProps {
  open: boolean
  onClose: (shouldRefetch: boolean) => void
  id: string
  publisher: ProfileFragment | null
  defaultValues: IPublishOpportunityFormProps
}

const ModifyOpportunityModal: React.FC<IPublishOpportunityModalProps> = ({
  open,
  onClose,
  id,
  publisher,
  defaultValues
}) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'components.dashboard.modals.modify-opportunity'
  })
  const { t: e } = useTranslation('common', { keyPrefix: 'errors' })

  const { createPost } = useCreatePost()

  const { mutateAsync: upload } = useStorageUpload()

  const [isPending, setIsPending] = useState<boolean>(false)
  const [error, setError] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [image, setImage] = useState<File | null>(null)
  const [endDateDisabled, setEndDateDisabled] = useState<boolean>(true)
  const form = useForm<IPublishOpportunityFormProps>({ defaultValues })

  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues])

  const {
    handleSubmit,
    reset,
    resetField,
    register,
    clearErrors,
    formState: { errors }
  } = form

  const validUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch (e) {
      return false
    }
  }

  const onCancel = () => {
    clearErrors()
    reset(defaultValues)
    setError(false)
    setErrorMessage('')
    onClose(false)
  }

  const onSubmit = async (formData: IPublishOpportunityFormProps) => {
    setError(false)
    setIsPending(true)

    if (!publisher) {
      setErrorMessage(e('profile-null'))
      setError(true)
      setIsPending(false)
      return
    }

    try {
      const imageUrl = image
        ? (await upload({ data: [image] }))[0]
        : defaultValues.imageUrl

      const metadata = buildMetadata<OpportunityMetadataRecord>(
        publisher,
        [PostTags.OrgPublish.Opportunity],
        {
          version: MetadataVersion.OpportunityMetadataVersion['1.0.1'],
          type: PostTags.OrgPublish.Opportunity,
          id,
          ...formData,
          imageUrl
        }
      )

      await checkAuth(publisher.ownedBy)
      const createPostResult = await createPost(publisher, metadata)

      if (createPostResult.isFailure()) {
        setError(true)
        setErrorMessage(createPostResult.error.message)
        throw createPostResult.error.message
      }

      reset()
      onClose(true)
    } catch (e: any) {
      setErrorMessage(e.message)
      setError(true)
    }
    setIsPending(false)
  }

  const [minDate, setMinDate] = useState<string>(
    new Date().toLocaleDateString()
  )

  return (
    <GradientModal
      title={t('title')}
      open={open}
      onCancel={onCancel}
      onSubmit={handleSubmit((data) => onSubmit(data))}
      submitDisabled={isPending}
    >
      <div className="mx-12">
        {!isPending ? (
          <Form
            form={form}
            onSubmit={() => handleSubmit((data) => onSubmit(data))}
          >
            <Input
              suppressHydrationWarning
              label={t('name')}
              placeholder={t('name-placeholder')}
              error={!!errors.name?.type}
              {...register('name', {
                required: true,
                maxLength: 100
              })}
            />

            <Input
              label={t('start-date')}
              type="date"
              placeholder="yyyy-mm-dd"
              min={new Date().toLocaleDateString()}
              error={!!errors.startDate?.type}
              {...register('startDate', {
                required: true
              })}
              onChange={(e) => {
                if (
                  Date.parse(form.getValues('endDate')) <
                  Date.parse(e.target.value)
                ) {
                  resetField('endDate')
                }
                setMinDate(e.target.value)
              }}
            />
            <Input
              label={t('end-date')}
              type="endDate"
              placeholder="yyyy-mm-dd"
              disabled={!endDateDisabled}
              min={minDate}
              error={!!errors.endDate?.type}
              {...register('endDate', {})}
              onChange={(e) => {
                if (e.target.value === 'on') {
                  resetField('endDate')
                  setEndDateDisabled(!endDateDisabled)
                }
              }}
            />
            <Input
              label={t('hours')}
              placeholder="5.5"
              error={!!errors.hoursPerWeek?.type}
              {...register('hoursPerWeek', {
                required: true,
                pattern: {
                  value: /^(?!0*[.,]0*$|[.,]0*$|0*$)\d+[,.]?\d{0,1}$/,
                  message: t('hours-invalid')
                }
              })}
            />
            <Input
              suppressHydrationWarning
              label={t('category')}
              placeholder={t('category-placeholder')}
              error={!!errors.category?.type}
              {...register('category', { required: true, maxLength: 40 })}
            />
            <Input
              label={t('website')}
              placeholder="https://ecssen.ca/opportunity-link"
              error={!!errors.website?.type}
              {...register('website', {
                validate: (url) => {
                  return url == '' || validUrl(url) || t('website-invalid')
                }
              })}
            />
            <TextArea
              label={t('description')}
              placeholder={t('description-placeholder')}
              error={!!errors.description?.type}
              {...register('description', { required: true, maxLength: 250 })}
            />
            <FileInput
              defaultImageIPFS={defaultValues.imageUrl ?? ''}
              label={t('image')}
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
            />
          </Form>
        ) : (
          <Spinner />
        )}

        {error && (
          <Error
            message={`${e('generic-front')}${errorMessage}${e('generic-back')}`}
          />
        )}
      </div>
    </GradientModal>
  )
}

export default ModifyOpportunityModal

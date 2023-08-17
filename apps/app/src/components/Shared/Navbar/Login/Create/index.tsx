import { Button } from '@components/UI/Button'
import { ErrorMessage } from '@components/UI/ErrorMessage'
import { Form, useZodForm } from '@components/UI/Form'
import { Input } from '@components/UI/Input'
import { Spinner } from '@components/UI/Spinner'
import { PlusIcon } from '@heroicons/react/outline'
import { isRelayerResult } from '@lens-protocol/client'
import React, { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { object, string } from 'zod'

import { checkAuth, createProfile, isValidHandle } from '@/lib/lens-protocol'
import { useAppPersistStore } from '@/store/app'

/**
 * Properties of Create component
 */
export interface CreateProps {
  /**
   * Determines if extra styling should be shown for displaying in a modal
   */
  isModal?: boolean
}

/**
 * A component to create new Lens profile
 *
 * @example Create component used in a {@link Modal} in {@link MenuItems}
 * ```ts
 * <Modal
 *   title={t('create-profile')}
 *   show={showCreate}
 *   onClose={() => {
 *     setShowCreate(false)
 *   }}
 * >
 *   <div className="p-5">
 *     <Create isModal />
 *   </div>
 * </Modal>
 * ```
 */
const Create: FC<CreateProps> = ({ isModal = false }) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'components.shared.navbar.login.create'
  })
  const { t: e } = useTranslation('common', { keyPrefix: 'errors' })
  const { currentUser } = useAppPersistStore()
  const [success, setSuccess] = useState<boolean>(false)
  const [error, setError] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [isPending, setIsPending] = useState<boolean>(false)

  const newUserSchema = object({
    handle: string()
      .min(5, { message: t('min') })
      .max(31, { message: t('max') })
      .regex(/^[a-z0-9]+$/, {
        message: t('regex')
      })
  })

  const form = useZodForm({
    schema: newUserSchema
  })

  return (
    <Form
      form={form}
      className="space-y-4"
      onSubmit={async ({ handle }) => {
        setIsPending(true)
        setError(false)
        const username = handle.toLowerCase()
        if (isValidHandle(username)) {
          try {
            if (!currentUser) throw Error(e('profile-null'))
            await checkAuth(currentUser.ownedBy)
            const result = await createProfile(username)
            if (!isRelayerResult(result)) {
              setErrorMessage(`${result.reason}`)
              setError(true)
            } else {
              setSuccess(true)
            }
          } catch (e) {
            if (e instanceof Error) {
              setErrorMessage(e.message)
              setError(true)
            }
          }
        }
        setIsPending(false)
      }}
    >
      {error && (
        <ErrorMessage
          className="mb-3"
          title={t('error')}
          error={{
            name: t('error'),
            message: errorMessage
          }}
        />
      )}
      {success && (
        <div
          className={`bg-green-50 dark:bg-green=-900 dark:bg-opacity-10 border-2 border-green-500 border-opacity-50 p-4 space-y-1 rounded-xl`}
        >
          <h3
            className="text-sm font-medium text-green-800 dark:text-green-200"
            suppressHydrationWarning
          >
            {t('success')}
          </h3>
          <div
            className="text-sm text-green-700 dark:text-green-200"
            suppressHydrationWarning
          >
            {t('close')}
          </div>
        </div>
      )}
      {isModal && (
        <div className="mb-2 space-y-4">
          <img
            className="w-10 h-10"
            height={40}
            width={40}
            src="/logo.svg"
            alt="Logo"
          />
          <div className="text-xl font-bold" suppressHydrationWarning>
            {t('signup')}
          </div>
        </div>
      )}
      <Input
        label={t('handle')}
        type="text"
        placeholder="gavin"
        {...form.register('handle')}
      />
      <Button
        className="ml-auto"
        type="submit"
        disabled={isPending}
        icon={
          isPending ? <Spinner size="xs" /> : <PlusIcon className="w-4 h-4" />
        }
      >
        {t('button-signup')}
      </Button>
    </Form>
  )
}

export default Create

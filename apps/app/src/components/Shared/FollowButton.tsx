import { FC, ReactNode, useEffect } from 'react'
import { toast } from 'react-hot-toast'

import { checkAuth } from '@/lib/lens-protocol'
import useFollow from '@/lib/lens-protocol/useFollow'
import { useAppPersistStore } from '@/store/app'

import { Button } from '../UI/Button'
import { Spinner } from '../UI/Spinner'

interface Props {
  followId: string
  icon?: ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const FollowButton: FC<Props> = ({ followId, icon, className, size }) => {
  const { currentUser } = useAppPersistStore()
  const { following, isLoading, error, followUser, unfollowUser } = useFollow({
    followerAddress: currentUser?.ownedBy ?? '',
    profileId: followId
  })

  useEffect(() => {
    if (error) toast.error(error)
  }, [error])

  return (
    <Button
      disabled={isLoading}
      icon={isLoading ? <Spinner size="sm" /> : icon}
      onClick={() => {
        if (!currentUser) return
        checkAuth(currentUser.ownedBy).then(() => {
          if (following) {
            unfollowUser(currentUser.ownedBy, followId)
          } else {
            followUser(currentUser.ownedBy, followId)
          }
        })
      }}
      size={size ? size : 'sm'}
      className={className}
    >
      {following ? 'Unfollow' : 'Follow'}
    </Button>
  )
}

export default FollowButton

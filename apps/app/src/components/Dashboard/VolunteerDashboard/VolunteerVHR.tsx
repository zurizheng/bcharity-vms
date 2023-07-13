import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { useBalance } from 'wagmi'

import { GridItemTwelve, GridLayout } from '@/components/GridLayout'
import { Card } from '@/components/UI/Card'
import { Spinner } from '@/components/UI/Spinner'
import { VHR_TOKEN } from '@/constants'
import { useAppPersistStore } from '@/store/app'

const VolunteerVHRTab: React.FC = () => {
  const { isAuthenticated, currentUser } = useAppPersistStore()

  const [searchAddress, setSearchAddress] = useState<string>('')
  const [vhrGoal, setVhrGoal] = useState(600) // use hardcoded goal for now

  const { data, isLoading } = useBalance({
    address: `0x${searchAddress.substring(2)}`,
    token: `0x${VHR_TOKEN.substring(2)}`
  })

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      setSearchAddress(currentUser.ownedBy)
    }
  }, [currentUser, isAuthenticated])

  const Progress = ({
    progress,
    total,
    className
  }: {
    progress: number
    total: number
    className?: string
  }) => (
    <div className={className}>
      <div className="w-full bg-gray-200 rounded-full h-5 ">
        <div
          className="bg-green-400 h-5 rounded-full"
          style={{
            width: `${Math.min(Math.trunc((progress / total) * 100), 100)}%`
          }}
        ></div>
      </div>
    </div>
  )

  return (
    <GridLayout>
      <GridItemTwelve>
        <Card>
          <div className="p-10 m-10">
            {isLoading ? (
              <Spinner />
            ) : (
              <>
                <div className="flex items-center">
                  <div className="text-2xl font-bold text-black sm:text-4xl">
                    VHR Amount:
                  </div>
                  <div className="text-2xl font-extrabold text-black sm:text-7xl pl-10">
                    {Number(data?.value)} / {vhrGoal}
                  </div>
                </div>
                <Link
                  href=""
                  className="text-brand-500 hover:text-brand-600"
                  onClick={() => {
                    console.log('Set a goal')
                  }}
                >
                  Set a goal
                </Link>
                <Progress
                  progress={Number(data?.value)}
                  total={vhrGoal}
                  className="mt-10 mb-10"
                />
                {Number(data?.value) < vhrGoal ? (
                  <div className="text-2xl font-normal text-black sm:text-2xl">
                    {vhrGoal - Number(data?.value)} away from goal!
                  </div>
                ) : (
                  <div className="text-2xl font-normal text-black sm:text-2xl">
                    Reached goal!
                  </div>
                )}
              </>
            )}
          </div>
        </Card>
      </GridItemTwelve>
    </GridLayout>
  )
}

export default VolunteerVHRTab
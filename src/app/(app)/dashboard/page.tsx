'use client'

import MessageCard from '@/components/customUi/MessageCard'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'
import { Message, User } from '@/model/User'
import { acceptMessageSchema } from '@/schemas/acceptMessageSchema'
import { ApiResponse } from '@/types/apiResponse'
import { zodResolver } from '@hookform/resolvers/zod'

import axios, { AxiosError } from 'axios'
import { Loader2, RefreshCcw } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

const DashboardPage = () => {
  const router = useRouter()
  const {toast} = useToast()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSwitchLoading, setIsSwitchLoading] = useState(false)

  const handleDeleteMessage = (messageId: string | unknown) => {
    setMessages(messages.filter((message) => message._id !== messageId))
  }

  const {data:session} = useSession()

  const form = useForm({
    resolver: zodResolver(acceptMessageSchema)
  })

  const {register, watch, setValue} = form

  const acceptMessages = watch('acceptMessages')

  const fetchAcceptMessage = useCallback(async() =>{
    setIsSwitchLoading(true)
    try {
      const response = await axios.get<ApiResponse>('/api/accept-messages')
      console.log({response})
      setValue('acceptMessages', response?.data?.isAcceptingMessage)
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast({
        title: "Error",
        description: axiosError?.response?.data?.message || "Failed to fetch message settings",
        variant: "destructive"
      })
    } finally {
      setIsSwitchLoading(false);
    }
  }, [setValue])

  const fetchMessages = useCallback(async(refresh: boolean = false) =>{
    setIsLoading(true)
    setIsSwitchLoading(false)
    try {
      const response:any = await axios.get<ApiResponse>('/api/get-messages')
      setMessages(response?.data?.message || [])
      if(refresh){
        toast({
          title: "Refreshed Messages",
          description: "Showing latest messages"
        })
      }
    } catch (error) {
      console.error("Error in fetching messages", error)
      const axiosError = error as AxiosError<ApiResponse>
      toast({
        title: "Error in fetching messages",
        description: axiosError?.response?.data?.message || "Failed to fetch messages",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
      setIsSwitchLoading(false);
    }
  }, [setIsLoading, setMessages])

  useEffect(() => {
    if(!session || !session.user) return;
    fetchMessages()
    fetchAcceptMessage()
  }, [session, setValue, fetchAcceptMessage, fetchMessages])

  //handle switch change
  const handleSwitchChange = async () => {
    try {
      const response = await axios.post<ApiResponse>('/api/accept-messages', {
        acceptMessages: !acceptMessages
      })
      setValue('acceptMessages', !acceptMessages)
      toast({
        title: response.data.message,
        // variant: "destructive"
      })
    } catch (error) {
      console.error("Error in accepting messages", error)
      const axiosError = error as AxiosError<ApiResponse>
      toast({
        title: "Error in accepting messages",
        description: axiosError?.response?.data?.message || "Failed to fetch messages",
        variant: "destructive"
      })
    }
  }

  if(!session || !session.user) {
    return 
  };

  const { username } = session?.user as User
  const baseUrl = `${window.location.protocol}//${window.location.host}`;
  const profileUrl = `${baseUrl}/u/${username}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast({
      title: 'URL Copied!',
      description: 'Profile URL has been copied to clipboard.',
    });
  };

  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4"> User Dashboard</h1>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>{' '}
        <div className="flex items-center">
          <input
            type="text"
            value={profileUrl}
            disabled
            className="input input-bordered w-full p-2 mr-2"
          />
          <Button className='bg-slate-900 text-gray-50' variant="default" onClick={copyToClipboard}>Copy</Button>
        </div>
      </div>

      <div className="mb-4">
        <Switch
          {...register('acceptMessages')}
          checked={acceptMessages}
          onCheckedChange={handleSwitchChange}
          disabled={isSwitchLoading}
        />
        <span className="ml-2">
          Accept Messages: {acceptMessages ? 'On' : 'Off'}
        </span>
      </div>
      <Separator />

      <Button
        className="mt-4"
        //@ts-ignore
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          fetchMessages(true);
        }}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCcw className="h-4 w-4" />
        )}
      </Button>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages.length > 0 ? (
          messages?.map((message:any, index) => (
            <MessageCard
              key= {message.createdAt.toString()}
              message={message}
              onMessageDelete={handleDeleteMessage}
            />
          ))
        ) : (
          <p>No messages to display.</p>
        )}
      </div>
    </div>
  )
}

export default DashboardPage
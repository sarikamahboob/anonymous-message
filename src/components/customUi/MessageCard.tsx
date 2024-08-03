'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { Message } from "@/model/User"
import { useToast } from "../ui/use-toast"
import { ApiResponse } from "@/types/apiResponse"
import axios from "axios"

type MessageCardProps = {
  message: Message;
  onMessageDelete: (messageId: string | unknown) => void;
}

const MessageCard = ({message, onMessageDelete}: MessageCardProps) => {
  const {toast} = useToast()
  const date = new Date(message?.createdAt)
  const formattedDate = date.toDateString()

  const handleDeleteConfirm = async () => {
    const response = await axios.delete<ApiResponse>(`/api/delete-message/${message?._id}`)
    toast({
      title: response?.data?.message,
      description: ""
    })
    onMessageDelete(message?._id)
  }
  return (
    <div>
      <Card>
        <CardHeader className="flex flex-row justify-between">
          <CardTitle>{message?.content}</CardTitle>
          <AlertDialog>
            <AlertDialogTrigger asChild className="sticky">
              <Button variant="destructive" className="w-10 h-10 p-2">
                <X className="w-14 h-10" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your data.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteConfirm} >
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardHeader>

        <CardContent>{formattedDate}</CardContent>
      </Card>
    </div>
  )
}

export default MessageCard
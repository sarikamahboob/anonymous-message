import { authOptions } from "../../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { getServerSession, User } from "next-auth";

export async function DELETE(request: Request, {params}: {params: {messageId: string}}) {
  const messageId = params.messageId
  await dbConnect()

  const session = getServerSession(authOptions)
  //@ts-ignore
  const user: User = session?.user as User
  //@ts-ignore
  if(!session || !session?.user) {
    return Response.json(
      {
        success: false,
        message: "Not authenticated",
      },
      {
        status: 401
      }
    )
  }

  try {
    const updatedResult = await UserModel.updateOne(
      {_id: user._id},
      { $pull : {messages: {_id: messageId}}}
    )
    if(updatedResult?.modifiedCount === 0) {
      return Response.json(
        {
          success: false,
          message: "Message not found or already deleted",
        },
        {
          status: 404
        }
      )
    }
    return Response.json(
      {
        success: true,
        message: "Message deleted",
      },
      {
        status: 200
      }
    )
  } catch (error) {
    console.error("Error in deleting message", error);
    return Response.json(
      {
        success: false,
        message: "Error in deleting message",
      },
      {
        status: 500
      }
    )
  }
}
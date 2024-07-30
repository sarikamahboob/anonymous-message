import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import mongoose from "mongoose";
import { getServerSession, User } from "next-auth";

export async function GET(request: Request) {
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

  const userId = new mongoose.Types.ObjectId(user._id)

  try {
    const user = await UserModel.aggregate([
      { $match: {id: userId} },
      { $unwind: '$messages' },
      { $sort: {'messages.createdAt': -1}},
      { $group: {_id: '$_id', messages: {$push: '$messages' }}}
    ])

    if(!user || user.length === 0){
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        {
          status: 401
        }
      )
    }

    return Response.json(
      {
        success: true,
        message: user[0].messages,
      },
      {
        status: 200
      }
    )
  } catch (error) {
    console.error("An unexpected error occurred", error)
    return Response.json(
      {
        success: true,
        message: "An unexpected error occurred"
      },
      {
        status: 500,
      }
    )
  }
}
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import mongoose from "mongoose";
import { getServerSession, User } from "next-auth";

export async function GET(request: Request) {
  await dbConnect()

  const session = await getServerSession(authOptions)
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
    const user = await UserModel
      .aggregate([
        { $match: { _id: userId } },
        {
          $unwind: {
            path: "$messages",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $sort: { "message.createdAt": -1 },
        },
        { $group: { _id: "$_id", message: { $push: "$messages" } } },
      ])
      // .exec();

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
        message: user[0].message,
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
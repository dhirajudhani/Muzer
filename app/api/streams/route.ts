import { prismaClient } from "@/app/lib/db";
import { NextResponse, type NextRequest } from "next/server";
import { type } from "os";
import { bigint, z } from "zod";

//@ts-ignore
import youtubesearchapi from "youtube-search-api"

const YT_REGEX = /^(?:(?:https?:)?\/\/)?(?:www\.)?(?:m\.)?(?:youtu(?:be)?\.com\/(?:v\/|embed\/|watch(?:\/|\?v=))|youtu\.be\/)((?:\w|-){11})(?:\S+)?$/



const CreateStreamSchema = z.object({
  creatorId: z.string(),
  url: z.string(), // it should have either youtube or spotify
});

export async function POST(req: NextRequest) {
  try {
    const data = CreateStreamSchema.parse(await req.json());
    const isYoutube =   data.url.match(YT_REGEX)
    if(!isYoutube){
      return NextResponse.json({
        message: "Wrong url format",
      },{
        status: 411
      })
    }

    const extractedId  = data.url.split("?v=")[1];

    const res = await youtubesearchapi.GetVideoDetails(extractedId)
   
    const thumbnails = res.thumbnail.thumbnails;
    thumbnails.sort((a: {width:number}, b:{width:number}) => a.width < b.width ? -1 : 1)


    // Add a rate limiter

    // Creating an entry in db using "create"
    const stream = await prismaClient.stream.create({
      data:{
        userId: data.creatorId,
        url : data.url,
        extractedId,
        type: "Youtube",
        title: res.title ?? "Cant find video",
        smallImg: (thumbnails.length > 1 ? thumbnails[thumbnails.length - 2].url : thumbnails[thumbnails.length - 1].url) ?? "https://imgs.search.brave.com/TDwqLzRXrr3isPn0tDoLBmboMRy06YO4AXZ37UnVkBk/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzA2LzI1LzU3LzE5/LzM2MF9GXzYyNTU3/MTkyMV90VWxGVUd2/OTRxS1drN1VOaG9W/TndROUI5QXEwVEx1/di5qcGc",
        bigImg: thumbnails[thumbnails.length - 1].url ?? "https://imgs.search.brave.com/TDwqLzRXrr3isPn0tDoLBmboMRy06YO4AXZ37UnVkBk/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzA2LzI1LzU3LzE5/LzM2MF9GXzYyNTU3/MTkyMV90VWxGVUd2/OTRxS1drN1VOaG9W/TndROUI5QXEwVEx1/di5qcGc"
      }
     
    })
    return NextResponse.json({
        message: "Added stream",
        id : stream.id
    })
    
  } catch (error) {
    return NextResponse.json(
      {
        message: "Error while adding a stream",
      },
      {
        status: 411,
      }
    );
  }
}


export async function GET(req : NextRequest){
  const creatorId = req.nextUrl.searchParams.get("creatorId");
  const streams = await prismaClient.stream.findMany({
    where: {
      userId : creatorId ?? ""
    }
  })
  return NextResponse.json({
    streams
  })
}
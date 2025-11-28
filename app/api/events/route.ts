import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Event from '@/database/event.model';
import { v2 as cloudinary } from 'cloudinary';

//* Create Event API
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const formData = await req.formData();
    let event;

    try {
      event = Object.fromEntries(formData.entries());
    } catch (error) {
      return NextResponse.json(
        {
          message: 'Invalid json format data',
        },
        { status: 400 }
      );
    }

    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        {
          message: 'Image file is required',
        },
        { status: 400 }
      );
    }

    let tags = JSON.parse(formData.get('tags') as string);
    let agenda = JSON.parse(formData.get('agenda') as string);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise((res, rej) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: 'image',
            folder: 'DevEvent',
          },
          (error, result) => {
            if (error) {
              rej(error);
            }
            res(result);
          }
        )
        .end(buffer);
    });

    event.image = (uploadResult as { secure_url: string })?.secure_url;

    const createdEvent = await Event.create({ ...event, tags: tags, agenda: agenda });

    return NextResponse.json(
      {
        message: 'Event created successfully',
        event: createdEvent,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        message: 'Event creation failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

//* Get All Events API
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const events = await Event.find().sort({ createdAt: -1 });
    if (!events) {
      return NextResponse.json(
        {
          message: 'No events found',
        },
        { status: 404 }
      );
    }
    return NextResponse.json({ message: 'Events fetched successfully', events }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        message: 'Event fetching Events',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

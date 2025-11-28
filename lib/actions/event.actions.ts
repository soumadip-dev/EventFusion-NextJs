'use server';
import connectDB from '@/lib/mongodb';
import Event from '@/database/event.model';

export const getSimilerEventsBySlug = async (slug: string) => {
  try {
    await connectDB();

    const event = await Event.findOne({ slug });
    const similerEvents = await Event.find({
      tags: { $in: event?.tags },
      _id: { $ne: event?._id },
    }).lean();

    return similerEvents;
  } catch (error) {
    console.error('Error fetching similer events:', error);
    return [];
  }
};

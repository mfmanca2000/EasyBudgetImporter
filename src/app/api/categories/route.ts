import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { MacroCategory, MicroCategory } from '@/models';

export async function GET() {
  try {
    await connectDB();
    
    // Fetch all macro categories
    const macroCategories = await MacroCategory.find({}).lean();
    
    // Fetch all micro categories with their macro category references
    const microCategories = await MicroCategory.find({}).lean();
    
    // Transform the data to match the expected format in the frontend
    const transformedMacroCategories = macroCategories.map(macro => ({
      _id: macro._id,
      name: macro.Name
    }));
    
    const transformedMicroCategories = microCategories.map(micro => ({
      _id: micro._id,
      name: micro.Name,
      macroCategory: micro.MacroID
    }));
    
    return NextResponse.json({ 
      macroCategories: transformedMacroCategories, 
      microCategories: transformedMicroCategories 
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
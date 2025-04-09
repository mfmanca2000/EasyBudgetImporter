import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

type CategoryBinding = {
  merchantCategory: string;
  macroCategory: string;
  microCategory: string;
};

// Path to the JSON file that will store the category bindings
const bindingsFilePath = path.join(process.cwd(), 'category-bindings.json');

// Helper function to read bindings from file
const readBindingsFromFile = (): CategoryBinding[] => {
  try {
    if (fs.existsSync(bindingsFilePath)) {
      const fileContent = fs.readFileSync(bindingsFilePath, 'utf-8');
      return JSON.parse(fileContent);
    }
    return [];
  } catch (error) {
    console.error('Error reading category bindings file:', error);
    return [];
  }
};

// Helper function to write bindings to file
const writeBindingsToFile = (bindings: CategoryBinding[]): boolean => {
  try {
    fs.writeFileSync(bindingsFilePath, JSON.stringify(bindings, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing category bindings file:', error);
    return false;
  }
};

// GET handler to retrieve all category bindings
export async function GET() {
  try {
    const bindings = readBindingsFromFile();
    return NextResponse.json({ bindings });
  } catch (error) {
    console.error('Error fetching category bindings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category bindings' },
      { status: 500 }
    );
  }
}

// POST handler to save category bindings
export async function POST(request: Request) {
  try {
    const { bindings } = await request.json();
    
    if (!Array.isArray(bindings)) {
      return NextResponse.json(
        { error: 'Invalid data format' },
        { status: 400 }
      );
    }
    
    const success = writeBindingsToFile(bindings);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to save category bindings' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ message: 'Category bindings saved successfully' });
  } catch (error) {
    console.error('Error saving category bindings:', error);
    return NextResponse.json(
      { error: 'Failed to save category bindings' },
      { status: 500 }
    );
  }
}
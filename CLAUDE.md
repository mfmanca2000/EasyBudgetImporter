# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` - Starts Next.js development server
- **Build**: `npm run build` - Creates production build
- **Production server**: `npm run start` - Runs production server
- **Linting**: `npm run lint` - Runs ESLint for code quality checks

## Architecture Overview

This is a Next.js application for importing financial data from bank/credit card CSV files into a MongoDB database. The app supports multiple bank formats and provides category management for expense tracking.

### Core Components

- **File Processing**: Handles CSV parsing for multiple bank formats (Swiss credit cards, Wise, Swisscards, Zak)
- **Category Management**: Two-tier category system (macro/micro categories) with merchant-to-category bindings
- **Data Models**: Expenses, Incomes, MacroCategories, MicroCategories with auto-incrementing IDs via Counter collection
- **Database**: MongoDB with Mongoose ODM, connection caching for Next.js

### Key Features

- **Multi-format CSV Import**: Automatically detects and processes different bank CSV formats
- **Category Binding System**: Maps merchant categories to expense categories automatically via `category-bindings.json`
- **Income/Expense Separation**: Automatically categorizes transactions based on amount sign
- **Visual Data Editing**: Table interface for reviewing and editing imported data before saving

### File Structure

- `/src/app/page.tsx` - Main application UI with tabbed interface
- `/src/components/` - Reusable UI components (FileUploader, ExpenseTable, CategoryBindingManager)
- `/src/lib/db.ts` - MongoDB connection with caching
- `/src/models/` - Mongoose schemas for all collections
- `/src/app/api/` - Next.js API routes for data operations
- `category-bindings.json` - Configuration for merchant category mappings

### Environment Requirements

- `MONGODB_URI` - Required environment variable for database connection

### Data Flow

1. CSV file upload and format detection
2. Data parsing based on detected format
3. Category binding application
4. User review and editing
5. Database insertion with auto-incrementing IDs
6. Separation into Expenses and Incomes collections

### Bank Format Support

- **Swiss Credit Cards**: Uses "Data transazione", "Descrizione", "Importo", "Categoria commerciante" columns
- **Wise/Swisscards**: Uses "Date", "Description", "Amount", "Category" columns
- **Zak**: Date format dd.MM.yy, handles negative amounts as expenses

### UI Framework

- **Next.js 14** with App Router
- **Material-UI (MUI)** for components
- **Tailwind CSS** for styling
- **React Toastify** for notifications
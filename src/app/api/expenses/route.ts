import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Expense, Income, Counter } from '@/models';

export async function POST(request: Request) {
  try {
    await connectDB();
    
    const data = await request.json();
    
    if (!Array.isArray(data.expenses) || data.expenses.length === 0) {
      return NextResponse.json(
        { error: 'Invalid expenses data' },
        { status: 400 }
      );
    }
    
    // Separate expenses and incomes based on amount
    const expensesData = [];
    const incomesData = [];
    
    data.expenses.forEach((item: any) => {
      if (item.amount < 0) {
        // Negative amount means it's an income
        incomesData.push({
          date: item.date,
          description: item.description,
          amount: Math.abs(item.amount), // Store as positive value
          category: item.microCategory // Use microCategory as the category for income
        });
      } else {
        // Positive amount means it's an expense
        expensesData.push({
          date: item.date,
          description: item.description,
          amount: item.amount,
          microCategory: item.microCategory
        });
      }
    });
    
    let expensesCount = 0;
    let incomesCount = 0;
    
    // Process expenses if any
    if (expensesData.length > 0) {
      // Get the current counter value for Expenses
      let expenseCounter = await Counter.findById('Expenses');
      
      // If counter doesn't exist, create it
      if (!expenseCounter) {
        expenseCounter = await Counter.create({ _id: 'Expenses', seq: 0 });
      }
      
      // Get the current sequence value
      let currentExpenseSeq = expenseCounter.seq;
      
      // Format expenses
      const formattedExpenses = expensesData.map((expense: any, index: number) => ({
        _id: currentExpenseSeq + index,
        Date: expense.date,
        Description: expense.description,
        Amount: expense.amount,
        MicroCategory: expense.microCategory,
        Recurrent: 0 // Setting default value as defined in the schema
      }));
      
      // Insert all expenses
      const expenseResult = await Expense.insertMany(formattedExpenses);
      expensesCount = expenseResult.length;
      
      // Update the counter with the new sequence value
      await Counter.findByIdAndUpdate('Expenses', { 
        seq: currentExpenseSeq + formattedExpenses.length + 1
      });
    }
    
    // Process incomes if any
    if (incomesData.length > 0) {
      // Get the current counter value for Incomes
      let incomeCounter = await Counter.findById('Incomes');
      
      // If counter doesn't exist, create it
      if (!incomeCounter) {
        incomeCounter = await Counter.create({ _id: 'Incomes', seq: 0 });
      }
      
      // Get the current sequence value
      let currentIncomeSeq = incomeCounter.seq;
      
      // Format incomes
      const formattedIncomes = incomesData.map((income: any, index: number) => ({
        _id: currentIncomeSeq + index,
        Date: income.date,
        Description: income.description,
        Amount: income.amount, // Amount is already positive from earlier processing
        MicroCategory: income.category
      }));
      
      // Insert all incomes
      const incomeResult = await Income.insertMany(formattedIncomes);
      incomesCount = incomeResult.length;
      
      // Update the counter with the new sequence value
      await Counter.findByIdAndUpdate('Incomes', { 
        seq: currentIncomeSeq + formattedIncomes.length + 1
      });
    }
    
    // Prepare success message
    let message = '';
    if (expensesCount > 0 && incomesCount > 0) {
      message = `Successfully imported ${expensesCount} expenses and ${incomesCount} incomes`;
    } else if (expensesCount > 0) {
      message = `Successfully imported ${expensesCount} expenses`;
    } else if (incomesCount > 0) {
      message = `Successfully imported ${incomesCount} incomes`;
    } else {
      message = 'No records were imported';
    }
    
    return NextResponse.json({ 
      success: true, 
      expensesCount,
      incomesCount,
      message
    });
  } catch (error) {
    console.error('Error saving expenses:', error);
    return NextResponse.json(
      { error: 'Failed to save expenses' },
      { status: 500 }
    );
  }
}
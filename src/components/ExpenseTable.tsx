import { useState } from 'react';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { TextField, MenuItem, Select, FormControl, InputLabel, Checkbox, IconButton, Tooltip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

type MacroCategory = {
  _id: string;
  name: string;
};

type MicroCategory = {
  _id: string;
  name: string;
  macroCategory: string;
};

type Expense = {
  id: string;
  date: Date;
  description: string;
  amount: number;
  macroCategory: string;
  microCategory: string;
  selected?: boolean;
};

type ExpenseTableProps = {
  expenses: Expense[];
  macroCategories: MacroCategory[];
  microCategories: MicroCategory[];
  onExpenseUpdate: (expense: Expense) => void;
};

const ExpenseTable = ({ 
  expenses, 
  macroCategories, 
  microCategories, 
  onExpenseUpdate 
}: ExpenseTableProps) => {
  // Function to handle description change
  const handleDescriptionChange = (id: string, value: string) => {
    const expense = expenses.find(exp => exp.id === id);
    if (expense) {
      onExpenseUpdate({
        ...expense,
        description: value
      });
    }
  };

  // Function to handle date change
  const handleDateChange = (id: string, date: Date) => {
    const expense = expenses.find(exp => exp.id === id);
    if (expense) {
      // Convert Date to yyyy-MM-dd string format
      const dateStr = format(date, 'yyyy-MM-dd');
      onExpenseUpdate({
        ...expense,
        date: dateStr
      });
    }
  };

  // Function to apply a date to all expenses
  const handleApplyDateToAll = (dateStr: string) => {
    expenses.forEach(expense => {
      onExpenseUpdate({
        ...expense,
        date: dateStr
      });
    });
  };

  // Function to handle macro category change
  const handleMacroCategoryChange = (id: string, macroCategoryId: string) => {
    const expense = expenses.find(exp => exp.id === id);
    if (expense) {
      // When macro category changes, reset micro category
      onExpenseUpdate({
        ...expense,
        macroCategory: macroCategoryId,
        microCategory: ''
      });
    }
  };

  // Function to handle micro category change
  const handleMicroCategoryChange = (id: string, microCategoryId: string) => {
    const expense = expenses.find(exp => exp.id === id);
    if (expense) {
      onExpenseUpdate({
        ...expense,
        microCategory: microCategoryId
      });
    }
  };

  // Function to handle selection change
  const handleSelectionChange = (id: string, checked: boolean) => {
    const expense = expenses.find(exp => exp.id === id);
    if (expense) {
      onExpenseUpdate({
        ...expense,
        selected: checked
      });
    }
  };

  // Filter micro categories based on selected macro category
  const getFilteredMicroCategories = (macroCategoryId: string) => {
    return microCategories.filter(micro => micro.macroCategory === macroCategoryId);
  };

  return (
    <div className="card table-container">
      <table className="table">
        <thead>
          <tr>
            <th className="text-center">
              <Checkbox
                checked={expenses.length > 0 && expenses.every(e => e.selected !== false)}
                indeterminate={expenses.some(e => e.selected === false) && expenses.some(e => e.selected !== false)}
                onChange={(e) => {
                  const checked = e.target.checked;
                  expenses.forEach(expense => {
                    onExpenseUpdate({
                      ...expense,
                      selected: checked
                    });
                  });
                }}
                color="primary"
              />
            </th>
            <th>Date</th>
            <th>Description</th>
            <th>Amount</th>
            <th>Macro Category</th>
            <th>Micro Category</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map(expense => (
            <tr 
              key={expense.id} 
              className={`
                ${expense.amount < 0 ? 'bg-green-300' : ''}
                ${expense.selected !== false && expense.amount >= 0 && (!expense.macroCategory || !expense.microCategory) ? 'bg-red-500' : ''}
              `}
            >
              <td className="text-center">
                <Checkbox
                  checked={expense.selected !== false}
                  onChange={(e) => handleSelectionChange(expense.id, e.target.checked)}
                  color="primary"
                />
              </td>
              <td className="w-56 flex items-center">  
                <DatePicker
                  selected={expense.date ? new Date(expense.date) : null}
                  onChange={(date: Date) => handleDateChange(expense.id, date)}
                  dateFormat="yyyy-MM-dd"
                  className="form-input w-full"
                />
                <Tooltip title="Apply this date to all rows">
                  <IconButton 
                    size="small" 
                    onClick={() => handleApplyDateToAll(expense.date)}
                    aria-label="apply date to all"
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </td>
              <td>
                <TextField
                  value={expense.description}
                  onChange={(e) => handleDescriptionChange(expense.id, e.target.value)}
                  fullWidth
                  size="small"
                  variant="outlined"
                />
              </td>
              <td className="text-right">
                {new Intl.NumberFormat('de-CH', {
                  style: 'currency',
                  currency: 'CHF'
                }).format(expense.amount)}
              </td>
              <td>
                <FormControl fullWidth size="small">
                  <InputLabel id={`macro-label-${expense.id}`}>Macro Category</InputLabel>
                  <Select
                    labelId={`macro-label-${expense.id}`}
                    value={expense.macroCategory}
                    label="Macro Category"
                    onChange={(e) => handleMacroCategoryChange(expense.id, e.target.value)}
                  >
                    <MenuItem value=""><em>Select...</em></MenuItem>
                    {macroCategories.map(category => (
                      <MenuItem key={category._id} value={category._id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </td>
              <td>
                <FormControl 
                  fullWidth 
                  size="small"
                  disabled={!expense.macroCategory}
                >
                  <InputLabel id={`micro-label-${expense.id}`}>Micro Category</InputLabel>
                  <Select
                    labelId={`micro-label-${expense.id}`}
                    value={expense.microCategory}
                    label="Micro Category"
                    onChange={(e) => handleMicroCategoryChange(expense.id, e.target.value)}
                  >
                    <MenuItem value=""><em>Select...</em></MenuItem>
                    {expense.macroCategory && getFilteredMicroCategories(expense.macroCategory).map(category => (
                      <MenuItem key={category._id} value={category._id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExpenseTable;
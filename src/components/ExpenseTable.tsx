import { useState, useCallback, useEffect, memo } from 'react';
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

export type Expense = {
  id: string;
  date: string;
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

// Create a memoized row component to prevent unnecessary re-renders
const ExpenseRow = memo(({ 
  expense, 
  macroCategories, 
  microCategories, 
  onExpenseUpdate,
  getFilteredMicroCategories,
  onDescriptionChange,
  handleApplyDateToAll
}: {
  expense: Expense;
  macroCategories: MacroCategory[];
  microCategories: MicroCategory[];
  onExpenseUpdate: (expense: Expense) => void;
  getFilteredMicroCategories: (macroCategoryId: string) => MicroCategory[];
  onDescriptionChange: (id: string, value: string) => void;
  handleApplyDateToAll: (dateStr: string) => void;
}) => {
  const [description, setDescription] = useState(expense.description);
  
  // Update local state when expense description changes from parent
  useEffect(() => {
    setDescription(expense.description);
  }, [expense.description]);

  // Handle local description changes
  const handleLocalDescriptionChange = (value: string) => {
    setDescription(value);
  };
  
  // Debounced update to parent
  useEffect(() => {
    const timer = setTimeout(() => {
      if (description !== expense.description) {
        onDescriptionChange(expense.id, description);
      }
    }, 300); // 300ms debounce
  
    return () => clearTimeout(timer);
  }, [description, expense.id, expense.description, onDescriptionChange]);
  
  // Function to handle date change
  const handleDateChange = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    onExpenseUpdate({
      ...expense,
      date: dateStr
    });
  };
  
  // Function to handle macro category change
  const handleMacroCategoryChange = (macroCategoryId: string) => {
    onExpenseUpdate({
      ...expense,
      macroCategory: macroCategoryId,
      microCategory: ''
    });
  };
  
  // Function to handle micro category change
  const handleMicroCategoryChange = (microCategoryId: string) => {
    onExpenseUpdate({
      ...expense,
      microCategory: microCategoryId
    });
  };
  
  // Function to handle selection change
  const handleSelectionChange = (checked: boolean) => {
    onExpenseUpdate({
      ...expense,
      selected: checked
    });
  };
  
  return (
    <tr 
      className={`
        ${expense.amount < 0 ? 'bg-green-300' : ''}
        ${expense.selected !== false && expense.amount >= 0 && (!expense.macroCategory || !expense.microCategory) ? 'bg-red-500' : ''}
      `}
    >
      <td className="text-center">
        <Checkbox
          checked={expense.selected !== false}
          onChange={(e) => handleSelectionChange(e.target.checked)}
          color="primary"
        />
      </td>
      <td className="w-56 flex items-center">  
        <DatePicker
          selected={expense.date ? new Date(expense.date) : null}
          onChange={(date: Date) => handleDateChange(date)}
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
          value={description}
          onChange={(e) => handleLocalDescriptionChange(e.target.value)}
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
            onChange={(e) => handleMacroCategoryChange(e.target.value as string)}
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
            onChange={(e) => handleMicroCategoryChange(e.target.value as string)}
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
  );
});

const ExpenseTable = ({ 
  expenses, 
  macroCategories, 
  microCategories, 
  onExpenseUpdate 
}: ExpenseTableProps) => {
  // Filter micro categories based on selected macro category
  const getFilteredMicroCategories = useCallback((macroCategoryId: string) => {
    return microCategories.filter(micro => micro.macroCategory === macroCategoryId);
  }, [microCategories]);

  // Function to handle description change with debouncing built into the row component
  const handleDescriptionChange = useCallback((id: string, value: string) => {
    const expense = expenses.find(exp => exp.id === id);
    if (expense) {
      onExpenseUpdate({
        ...expense,
        description: value
      });
    }
  }, [expenses, onExpenseUpdate]);

  // Function to apply a date to all expenses
  const handleApplyDateToAll = useCallback((dateStr: string) => {
    expenses.forEach(expense => {
      onExpenseUpdate({
        ...expense,
        date: dateStr
      });
    });
  }, [expenses, onExpenseUpdate]);

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
            <ExpenseRow
              key={expense.id}
              expense={expense}
              macroCategories={macroCategories}
              microCategories={microCategories}
              onExpenseUpdate={onExpenseUpdate}
              getFilteredMicroCategories={getFilteredMicroCategories}
              onDescriptionChange={handleDescriptionChange}
              handleApplyDateToAll={handleApplyDateToAll}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExpenseTable;
import { useState } from 'react';
import { toast } from 'react-toastify';
import {
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

type MacroCategory = {
  _id: string;
  name: string;
};

type MicroCategory = {
  _id: string;
  name: string;
  macroCategory: string;
};

type CategoryBinding = {
  merchantCategory: string;
  macroCategory: string;
  microCategory: string;
};

type CategoryBindingManagerProps = {
  macroCategories: MacroCategory[];
  microCategories: MicroCategory[];
  categoryBindings: CategoryBinding[];
  setCategoryBindings: (bindings: CategoryBinding[]) => void;
};

const CategoryBindingManager = ({
  macroCategories,
  microCategories,
  categoryBindings,
  setCategoryBindings,
}: CategoryBindingManagerProps) => {
  const [open, setOpen] = useState(false);
  const [newBinding, setNewBinding] = useState<CategoryBinding>({
    merchantCategory: '',
    macroCategory: '',
    microCategory: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  // Filter micro categories based on selected macro category
  const getFilteredMicroCategories = (macroCategoryId: string) => {
    return microCategories.filter(micro => micro.macroCategory === macroCategoryId);
  };

  const handleOpenDialog = () => {
    setNewBinding({
      merchantCategory: '',
      macroCategory: '',
      microCategory: '',
    });
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
  };

  const handleInputChange = (field: keyof CategoryBinding, value: string) => {
    setNewBinding(prev => {
      const updated = { ...prev, [field]: value };
      
      // Reset micro category when macro category changes
      if (field === 'macroCategory') {
        updated.microCategory = '';
      }
      
      return updated;
    });
  };

  const handleAddBinding = () => {
    // Validate inputs
    if (!newBinding.merchantCategory || !newBinding.macroCategory) {
      toast.error('Please fill in merchant and macro category fields');
      return;
    }

    // Check if merchant category already exists
    const exists = categoryBindings.some(
      binding => binding.merchantCategory === newBinding.merchantCategory
    );

    if (exists) {
      toast.error('A binding for this merchant category already exists');
      return;
    }

    // Add new binding
    const updatedBindings = [...categoryBindings, newBinding];
    setCategoryBindings(updatedBindings);
    saveBindings(updatedBindings);
    handleCloseDialog();
  };

  const handleDeleteBinding = (merchantCategory: string) => {
    const updatedBindings = categoryBindings.filter(
      binding => binding.merchantCategory !== merchantCategory
    );
    setCategoryBindings(updatedBindings);
    saveBindings(updatedBindings);
  };

  const saveBindings = async (bindings: CategoryBinding[]) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/categoryBindings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bindings }),
      });

      if (!response.ok) {
        throw new Error('Failed to save category bindings');
      }

      toast.success('Category bindings saved successfully');
    } catch (error) {
      console.error('Error saving category bindings:', error);
      toast.error('Failed to save category bindings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Merchant Category Bindings</h2>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Add Binding
        </Button>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Merchant Category</TableCell>
              <TableCell>Macro Category</TableCell>
              <TableCell>Micro Category (Optional)</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categoryBindings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No bindings found. Add a new binding to get started.
                </TableCell>
              </TableRow>
            ) : (
              categoryBindings.map((binding) => (
                <TableRow key={binding.merchantCategory}>
                  <TableCell>{binding.merchantCategory}</TableCell>
                  <TableCell>
                    {macroCategories.find(m => m._id === binding.macroCategory)?.name || ''}
                  </TableCell>
                  <TableCell>
                    {microCategories.find(m => m._id === binding.microCategory)?.name || ''}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteBinding(binding.merchantCategory)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Binding Dialog */}
      <Dialog open={open} onClose={handleCloseDialog}>
        <DialogTitle>Add Merchant Category Binding</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Merchant Category"
            fullWidth
            value={newBinding.merchantCategory}
            onChange={(e) => handleInputChange('merchantCategory', e.target.value)}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Macro Category</InputLabel>
            <Select
              value={newBinding.macroCategory}
              label="Macro Category"
              onChange={(e) => handleInputChange('macroCategory', e.target.value)}
            >
              <MenuItem value=""><em>Select...</em></MenuItem>
              {macroCategories.map((category) => (
                <MenuItem key={category._id} value={category._id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl 
            fullWidth 
            margin="dense"
            disabled={!newBinding.macroCategory}
          >
            <InputLabel>Micro Category (Optional)</InputLabel>
            <Select
              value={newBinding.microCategory}
              label="Micro Category"
              onChange={(e) => handleInputChange('microCategory', e.target.value)}
            >
              <MenuItem value=""><em>Select...</em></MenuItem>
              {newBinding.macroCategory && 
                getFilteredMicroCategories(newBinding.macroCategory).map((category) => (
                  <MenuItem key={category._id} value={category._id}>
                    {category.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleAddBinding} 
            variant="contained" 
            color="primary"
            disabled={isSaving}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CategoryBindingManager;
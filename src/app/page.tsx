"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Papa from "papaparse";
import FileUploader from "@/components/FileUploader";
import ExpenseTable, { Expense } from "@/components/ExpenseTable";
import CategoryBindingManager from "@/components/CategoryBindingManager";
import {
  Button,
  Tabs,
  Tab,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";


type MacroCategory = {
  _id: string;
  name: string;
};

type MicroCategory = {
  _id: string;
  name: string;
  macroCategory: string;
};

// type Expense = {
//   id: string;
//   date: string; // Changed from Date to string in yyyy-MM-dd format
//   description: string;
//   amount: number;
//   macroCategory: string;
//   microCategory: string;
//   selected?: boolean;
// };

type CategoryBinding = {
  merchantCategory: string;
  macroCategory: string;
  microCategory: string;
};

export default function Home() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [macroCategories, setMacroCategories] = useState<MacroCategory[]>([]);
  const [microCategories, setMicroCategories] = useState<MicroCategory[]>([]);
  const [categoryBindings, setCategoryBindings] = useState<CategoryBinding[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // Fetch categories and bindings from the database
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesResponse = await fetch("/api/categories");
        if (!categoriesResponse.ok) {
          throw new Error("Failed to fetch categories");
        }
        const categoriesData = await categoriesResponse.json();
        setMacroCategories(categoriesData.macroCategories);
        setMicroCategories(categoriesData.microCategories);

        // Fetch category bindings
        const bindingsResponse = await fetch("/api/categoryBindings");
        if (!bindingsResponse.ok) {
          throw new Error("Failed to fetch category bindings");
        }
        const bindingsData = await bindingsResponse.json();
        setCategoryBindings(bindingsData.bindings);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data. Please refresh the page.");
      }
    };

    fetchData();
  }, []);

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    setIsLoading(true);

    try {
      if (file.name.endsWith(".csv")) {
      
        // Handle CSV file with existing logic
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          delimiter: ";",
          complete: (results) => processParsedData(results),
          error: (error) => {
            console.error("Error parsing CSV:", error);
            toast.error("Failed to parse the CSV file");
            setIsLoading(false);
          },
        });
      }
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error("Failed to process the uploaded file");
      setIsLoading(false);
    }
  };

  // Add this helper function
  function parseAmount(amountStr: string): number {
      const normalized = amountStr.replace(/'/g, '');
      return parseFloat(normalized);
  }

  // Extracted data processing logic
  const processParsedData = (results: Papa.ParseResult<any>) => {
    try {
      const parsedExpenses = results.data.map((row: any, index: number) => {
        let date,
          description,
          amount,
          merchantCategory,
          isSwisscardsFormat,
          isZakFormat;

        // Check for Swiss credit card format
        if ("Data transazione" in row) {
          // Swiss credit card format columns
          // Convert date from DD.MM.YYYY to yyyy-MM-dd format
          const dateParts = row["Data transazione"].split(".");
          date = `${dateParts[2]}-${dateParts[1].padStart(
            2,
            "0"
          )}-${dateParts[0].padStart(2, "0")}`;

          // Use Descrizione for description
          description = row["Descrizione"] || "";

          // Parse amount with comma as decimal separator
          // Replace comma with dot for proper parsing
          const amountStr = row["Importo"].replace(",", ".");
          // Determine if it's a debit or credit
          const isCredit = row["Debito/Credito"] === "Accredito";
          // For credits (payments), keep the negative sign to distinguish them from expenses
          amount = parseFloat(amountStr);

          // Get merchant category from the row
          merchantCategory = row["Categoria commerciante"] || "";
        } else {
          // Wise, Swisscards or Zak format
          // Check if date is in dd.MM.yy format (like 04.03.25)
          if (row["Date"] && row["Date"].includes(".")) {
            isZakFormat = true;
            const dateParts = row["Date"].split(".");
            // Convert dd.MM.yy to yyyy-MM-dd format (assuming 20yy for the year)
            date = `20${dateParts[2]}-${dateParts[1].padStart(
              2,
              "0"
            )}-${dateParts[0].padStart(2, "0")}`;
          } else {
            //Swisscards
            isSwisscardsFormat = true;
            date = row["Date"];
          }

          description = row["Description"] || "";

          // Parse amount - negative values are expenses (invert sign)
          const amountStr = row["Amount"].replace(",", ".");
          amount = Math.abs(parseFloat(amountStr));

          if (isSwisscardsFormat && parseFloat(amountStr) > 0) {
            amount = amount * -1; // Invert sign to match income convention in Swisscards
          }

          if (isZakFormat && parseFloat(amountStr) < 0) {
            amount = amount * -1; // Invert sign to match income convention in Zak
          }

          // Get merchant category from Category column
          merchantCategory = row["Category"] || "";
        }

        // Find matching binding for this merchant category
        const binding = categoryBindings.find(
          (b) => b.merchantCategory === merchantCategory
        );

        return {
          id: `temp-${index}`,
          date,
          description,
          amount,
          macroCategory: binding ? binding.macroCategory : "",
          microCategory: binding ? binding.microCategory : "",
          selected: true, // Selected by default
        };
      });

      setExpenses(parsedExpenses);
      setIsValid(false);
      toast.success(`Successfully parsed ${parsedExpenses.length} expenses`);
    } catch (error) {
      console.error("Error during parsing:", error);
      toast.error("Failed to process the file. Please check the format.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle expense update
  const handleExpenseUpdate = (updatedExpense: Expense) => {
    setExpenses((prevExpenses) => {
      const newExpenses = prevExpenses.map((expense) =>
        expense.id === updatedExpense.id ? updatedExpense : expense
      );

      // Check if all selected expenses have categories assigned
      const selectedExpenses = newExpenses.filter(
        (exp) => exp.selected !== false
      );
      const allValid =
        selectedExpenses.length > 0 &&
        selectedExpenses.every((exp) => exp.macroCategory && exp.microCategory);

      setIsValid(allValid);
      return newExpenses;
    });
  };

  // Open confirmation dialog before saving expenses
  const handleSaveExpensesClick = () => {
    if (!isValid) return;
    setConfirmDialogOpen(true);
  };

  // Close confirmation dialog
  const handleCloseConfirmDialog = () => {
    setConfirmDialogOpen(false);
  };

  // Handle save expenses after confirmation
  const handleSaveExpenses = async () => {
    setConfirmDialogOpen(false);
    setIsSaving(true);

    try {
      // Filter out unselected expenses and format for API
      const formattedExpenses = expenses
        .filter((exp) => exp.selected !== false) // Only include selected expenses
        .map((exp) => ({
          date: exp.date,
          description: exp.description,
          amount: exp.amount,
          macroCategory: exp.macroCategory,
          microCategory: exp.microCategory,
        }));

      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ expenses: formattedExpenses }),
      });

      if (!response.ok) {
        throw new Error("Failed to save expenses");
      }

      const result = await response.json();
      toast.success(result.message);

      // Reset the state for a new import
      setExpenses([]);
      setIsValid(false);
    } catch (error) {
      console.error("Error saving expenses:", error);
      toast.error("Failed to save expenses. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Reset the current import
  const handleReset = () => {
    setExpenses([]);
    setIsValid(false);
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <main className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Easy Budget Importer</h1>

      {expenses.length === 0 ? (
        <>
          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tab label="Import Expenses" />
              <Tab label="Manage Category Bindings" />
            </Tabs>
          </Box>

          {activeTab === 0 ? (
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Import Expenses</h2>
              <FileUploader
                onFileUpload={handleFileUpload}
                isLoading={isLoading}
              />
            </div>
          ) : (
            <CategoryBindingManager
              macroCategories={macroCategories}
              microCategories={microCategories}
              categoryBindings={categoryBindings}
              setCategoryBindings={setCategoryBindings}
            />
          )}
        </>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Edit Imported Expenses</h2>
            <div className="space-x-2">
              <Button
                variant="outlined"
                color="error"
                onClick={handleReset}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveExpensesClick}
                disabled={!isValid || isSaving}
              >
                {isSaving ? "Saving..." : "Save All Expenses"}
              </Button>
            </div>
          </div>

          <ExpenseTable
            expenses={expenses}
            macroCategories={macroCategories}
            microCategories={microCategories}
            onExpenseUpdate={handleExpenseUpdate}
          />
        </div>
      )}
      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCloseConfirmDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Conferma</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Hai selezionato la data corretta per tutte le spese?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog}>Annulla</Button>
          <Button
            onClick={handleSaveExpenses}
            autoFocus
            variant="contained"
            color="primary"
          >
            Conferma
          </Button>
        </DialogActions>
      </Dialog>
    </main>
  );
}

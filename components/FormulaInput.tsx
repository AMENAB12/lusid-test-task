import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useFormulaStore } from '@/lib/formulaStore';
import { CheckIcon, ChevronDownIcon, PencilIcon, XIcon, TableIcon, CalculatorIcon } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Variable = {
    id: string;
    name: string;
    category: string;
    value: number | string;
};

const OPERATORS = ['+', '-', '*', '/', '^', '(', ')'];

const FormulaInput: React.FC = () => {
    const {
        formula = [],
        addVariable,
        removeVariable,
        replaceVariable,
        calculateResult
    } = useFormulaStore();

    const [inputValue, setInputValue] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [result, setResult] = useState<number | null>(null);
    const [viewMode, setViewMode] = useState<'formula' | 'table'>('formula');
    const inputRef = useRef<HTMLInputElement>(null);
    const [selectedTagIndex, setSelectedTagIndex] = useState<number | null>(null);
    const [editingTagIndex, setEditingTagIndex] = useState<number | null>(null);
    const [editingValue, setEditingValue] = useState('');
    const editInputRef = useRef<HTMLInputElement>(null);

    // Fetch suggestions from API
    const { data: suggestions = [] } = useQuery<Variable[]>({
        queryKey: ['variableSuggestions', inputValue],
        queryFn: async () => {
            const response = await fetch('https://652f91320b8d8ddac0b2b62b.mockapi.io/autocomplete');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        },
        enabled: inputValue.length > 0 && !OPERATORS.includes(inputValue),
    });

    // Filter suggestions based on input
    const filteredSuggestions = suggestions.filter(item =>
        item.name.toLowerCase().includes(inputValue.toLowerCase())
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
        if (e.target.value) {
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        // Handle backspace to delete tags
        if (e.key === 'Backspace' && inputValue === '' && formula.length > 0) {
            e.preventDefault();
            removeVariable(formula.length - 1);
        }

        // Handle operators directly
        if (OPERATORS.includes(e.key)) {
            e.preventDefault();
            if (inputValue) {
                // Try to parse as number first
                const numValue = parseFloat(inputValue);

                // Add current input as a variable if there's text
                addVariable({
                    id: Date.now().toString(),
                    name: inputValue,
                    category: isNaN(numValue) ? 'custom' : 'number',
                    value: isNaN(numValue) ? 0 : numValue
                });
                setInputValue('');
            }

            // Add the operator as a variable
            addVariable({
                id: Date.now().toString(),
                name: e.key,
                category: 'operator',
                value: e.key
            });
        }

        // Handle Enter to add current input as a variable
        if (e.key === 'Enter' && inputValue) {
            e.preventDefault();

            // If we have suggestions and input matches partially, use first suggestion
            if (filteredSuggestions.length > 0 && showSuggestions) {
                handleSelectSuggestion(filteredSuggestions[0]);
            } else {
                // Try to parse as number first
                const numValue = parseFloat(inputValue);

                addVariable({
                    id: Date.now().toString(),
                    name: inputValue,
                    category: isNaN(numValue) ? 'custom' : 'number',
                    value: isNaN(numValue) ? 0 : numValue
                });
            }

            setInputValue('');
            setShowSuggestions(false);
        }

        // Handle Tab to select suggestion
        if (e.key === 'Tab' && showSuggestions && filteredSuggestions.length > 0) {
            e.preventDefault();
            handleSelectSuggestion(filteredSuggestions[0]);
        }

        // Handle equal sign to calculate
        if (e.key === '=' || e.key === 'Enter' && inputValue === '') {
            e.preventDefault();
            evaluateFormula();
        }
    };

    const handleSelectSuggestion = (suggestion: Variable) => {
        addVariable(suggestion);
        setInputValue('');
        setShowSuggestions(false);
        inputRef.current?.focus();
    };

    const handleReplaceVariable = (index: number, variable: Variable) => {
        replaceVariable(index, variable);
        setSelectedTagIndex(null);
    };

    const handleTagClick = (index: number) => {
        // If we're already editing a different tag, finish that edit first
        if (editingTagIndex !== null && editingTagIndex !== index) {
            finishEditing();
        }

        setSelectedTagIndex(index === selectedTagIndex ? null : index);
    };

    const startEditing = (index: number) => {
        const variable = formula[index];
        if (variable.category !== 'operator') {
            setEditingTagIndex(index);
            setEditingValue(variable.name);
            // Set a small timeout to ensure the DOM element is available
            setTimeout(() => {
                editInputRef.current?.focus();
                editInputRef.current?.select();
            }, 10);
        }
    };

    const handleEditingKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            finishEditing();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            cancelEditing();
        }
    };

    const finishEditing = () => {
        if (editingTagIndex !== null) {
            const numValue = parseFloat(editingValue);
            replaceVariable(editingTagIndex, {
                ...formula[editingTagIndex],
                name: editingValue,
                category: isNaN(numValue) ? 'custom' : 'number',
                value: isNaN(numValue) ? 0 : numValue
            });
            setEditingTagIndex(null);
            setEditingValue('');
            inputRef.current?.focus();
        }
    };

    const cancelEditing = () => {
        setEditingTagIndex(null);
        setEditingValue('');
        inputRef.current?.focus();
    };

    const evaluateFormula = () => {
        // If there's text in the input, add it first
        if (inputValue) {
            const numValue = parseFloat(inputValue);
            addVariable({
                id: Date.now().toString(),
                name: inputValue,
                category: isNaN(numValue) ? 'custom' : 'number',
                value: isNaN(numValue) ? 0 : numValue
            });
            setInputValue('');
        }

        const result = calculateResult();
        setResult(result);
    };

    const handleRemoveVariable = (index: number, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering other click handlers
        removeVariable(index);
    };

    useEffect(() => {
        // Keep focus on input unless we're editing a tag
        if (editingTagIndex === null) {
            inputRef.current?.focus();
        }
    }, [formula, editingTagIndex]);

    // Click outside handler to finish editing
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (editingTagIndex !== null &&
                editInputRef.current &&
                !editInputRef.current.contains(e.target as Node)) {
                finishEditing();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [editingTagIndex, editingValue]);

    return (
        <div className="w-full space-y-6">
            <div className="flex justify-between items-center">
                <Tabs defaultValue="formula" className="w-full" onValueChange={(value: string) => setViewMode(value as 'formula' | 'table')}>
                    <TabsList className="grid w-[240px] grid-cols-2 bg-gray-100 p-1 rounded-lg">
                        <TabsTrigger value="formula" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            <CalculatorIcon className="h-4 w-4" />
                            Formula
                        </TabsTrigger>
                        <TabsTrigger value="table" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            <TableIcon className="h-4 w-4" />
                            Table
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {viewMode === 'formula' ? (
                <div className="relative">
                    <div className="flex items-center border-2 rounded-xl p-4 bg-white min-h-14 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 shadow-sm">
                        <div className="flex flex-wrap gap-2 items-center flex-grow">
                            {Array.isArray(formula) && formula.map((item, index) => (
                                <div key={`${item.id}-${index}`} className="relative">
                                    {item.category === 'operator' ? (
                                        <span className="mx-1 text-gray-700 font-medium text-lg">{item.name}</span>
                                    ) : editingTagIndex === index ? (
                                        <div className="flex items-center px-4 py-2 rounded-lg bg-blue-50 border-2 border-blue-200 shadow-sm">
                                            <input
                                                ref={editInputRef}
                                                type="text"
                                                className="outline-none bg-transparent w-full text-blue-800"
                                                value={editingValue}
                                                onChange={(e) => setEditingValue(e.target.value)}
                                                onKeyDown={(e) => handleEditingKeyDown(e)}
                                                onBlur={finishEditing}
                                            />
                                            <button
                                                className="ml-2 text-blue-600 hover:text-blue-800"
                                                onClick={finishEditing}
                                            >
                                                <CheckIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <div
                                                    className={`
                                                        px-4 py-2 rounded-lg text-sm flex items-center gap-2 cursor-pointer
                                                        ${item.category === 'number'
                                                            ? 'bg-gradient-to-r from-gray-100 to-gray-50'
                                                            : 'bg-gradient-to-r from-blue-50 to-blue-100'}
                                                        ${selectedTagIndex === index ? 'ring-2 ring-blue-300' : ''}
                                                        group shadow-sm hover:shadow-md transition-all
                                                    `}
                                                    onClick={() => handleTagClick(index)}
                                                >
                                                    <span className="font-medium">{item.name}</span>
                                                    <div className="flex items-center">
                                                        <button
                                                            className="hidden group-hover:block mr-1 text-gray-600 hover:text-blue-600"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                startEditing(index);
                                                            }}
                                                        >
                                                            <PencilIcon className="h-3.5 w-3.5" />
                                                        </button>
                                                        <button
                                                            className="hidden group-hover:block mr-1 text-gray-600 hover:text-red-500"
                                                            onClick={(e) => handleRemoveVariable(index, e)}
                                                        >
                                                            <XIcon className="h-3.5 w-3.5" />
                                                        </button>
                                                        <ChevronDownIcon className="h-3.5 w-3.5 text-gray-500" />
                                                    </div>
                                                </div>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-56">
                                                <DropdownMenuItem
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        startEditing(index);
                                                    }}
                                                >
                                                    <div className="flex items-center text-sm">
                                                        <PencilIcon className="h-3 w-3 mr-2" />
                                                        Edit
                                                    </div>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={(e) => handleRemoveVariable(index, e)}
                                                >
                                                    <div className="flex items-center text-sm text-red-500">
                                                        <XIcon className="h-3 w-3 mr-2" />
                                                        Remove
                                                    </div>
                                                </DropdownMenuItem>
                                                <hr className="my-1" />
                                                <DropdownMenuItem className="text-xs text-gray-500 py-1 pointer-events-none">
                                                    Replace with:
                                                </DropdownMenuItem>
                                                {suggestions.slice(0, 5).map((suggestion, suggestionIndex) => (
                                                    <DropdownMenuItem
                                                        key={`${suggestion.id}-${suggestionIndex}`}
                                                        onClick={() => handleReplaceVariable(index, suggestion)}
                                                    >
                                                        <div className="flex items-center justify-between w-full">
                                                            <span>{suggestion.name}</span>
                                                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                                                {suggestion.category}
                                                            </span>
                                                        </div>
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </div>
                            ))}

                            <input
                                ref={inputRef}
                                type="text"
                                className="outline-none flex-grow min-w-[50px] bg-transparent text-gray-700 placeholder-gray-400"
                                value={inputValue}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                placeholder={formula.length === 0 ? "Enter formula" : ""}
                            />
                        </div>

                        <Button
                            onClick={evaluateFormula}
                            className="ml-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2 rounded-lg shadow-sm hover:shadow-md transition-all text-lg font-medium"
                        >
                            =
                        </Button>
                    </div>

                    {result !== null && (
                        <div className="absolute right-2 -bottom-8 text-xl font-semibold text-blue-600 bg-white px-4 py-2 rounded-lg shadow-sm">
                            = {result}
                        </div>
                    )}

                    {/* Autocomplete suggestions */}
                    {showSuggestions && filteredSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-2 bg-white border rounded-xl shadow-lg">
                            <ul className="py-1 max-h-60 overflow-auto">
                                {filteredSuggestions.slice(0, 7).map((suggestion, suggestionIndex) => (
                                    <li
                                        key={`${suggestion.id}-${suggestionIndex}`}
                                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex justify-between items-center transition-colors"
                                        onClick={() => handleSelectSuggestion(suggestion)}
                                    >
                                        <span className="font-medium text-gray-800">{suggestion.name}</span>
                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                            {suggestion.category}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            ) : (
                <div className="border rounded-xl shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100">
                                <TableHead className="font-semibold text-gray-800">Name</TableHead>
                                <TableHead className="font-semibold text-gray-800">Category</TableHead>
                                <TableHead className="font-semibold text-gray-800">Value</TableHead>
                                <TableHead className="font-semibold text-gray-800">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {formula.map((item, index) => (
                                <TableRow key={`${item.id}-${index}`} className="hover:bg-gray-50">
                                    <TableCell className="font-medium text-gray-800">{item.name}</TableCell>
                                    <TableCell>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${item.category === 'number'
                                                ? 'bg-gray-100 text-gray-700'
                                                : item.category === 'operator'
                                                    ? 'bg-purple-100 text-purple-700'
                                                    : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {item.category}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-gray-700">{item.value}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => startEditing(index)}
                                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                            >
                                                <PencilIcon className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemoveVariable(index, {} as React.MouseEvent)}
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <XIcon className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
};

export default FormulaInput;
/* eslint-disable react-hooks/exhaustive-deps */
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { ScrollArea } from "../ui/scroll-area";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { DropdownUser } from "@/lib/definitions";
import * as _ from "lodash";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export type SelectDebounceProps = {
  title: string;
  placeholder: string;
  notFound: string;
  options: DropdownUser[];
  searchData: (query: string) => Promise<void>;
  choiced: React.Dispatch<React.SetStateAction<DropdownUser | null>>;
  onSearch?: (value: string) => void;
  defaultValue?: DropdownUser | null;
};

export default function SelectUser({
  options,
  placeholder,
  notFound = "Tidak ada data yang ditemukan...",
  title = "Pilih data...",
  searchData,
  choiced,
  onSearch,
  defaultValue,
}: SelectDebounceProps) {
  const [selectedUser, setSelectedUser] = useState<DropdownUser | null>(
    defaultValue || null
  );
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [localOptions, setLocalOptions] = useState<DropdownUser[]>(options);
  const [search, setSearch] = useState(false);
  const debouncedSearchData = useMemo(
    () => _.debounce((query: string) => {
      searchData(query);
      onSearch?.(query);
    }, 500),
    [searchData, onSearch]
  );

  useEffect(() => {
    return () => {
      debouncedSearchData.cancel();
    };
  }, [debouncedSearchData]);

  useEffect(() => {
    if (defaultValue) {
      setSelectedUser(defaultValue);
      choiced(defaultValue);
    }
  }, [defaultValue]);

  const handleSelect = (value: DropdownUser) => {
    setSelectedUser(value);
    choiced(value);
    setOpen(false);
  };

  const handleSearch = (value: string) => {
    setSearch(true);
    if(value == "") {
      debouncedSearchData("");
      setInputValue("");
      setSearch(false);
      return;
    }
    setInputValue(value);
    const hasMatchingOptions = localOptions.some(option => 
      option.label.toLowerCase().includes(value.toLowerCase())
    );
    if (value && !hasMatchingOptions) {
      debouncedSearchData(value);
    }
    if (hasMatchingOptions) {
      setSearch(false);
    }
  };

  useEffect(() => {
    setLocalOptions(options);
  }, [options]);



  return (
    <Popover open={open} onOpenChange={setOpen} modal={true} defaultOpen={true}>
      <PopoverTrigger asChild className="col-span-3" name="user_id">
        <Button
          variant="ghost"
          role="combobox"
          className="justify-between col-span-3 bg-white border border-gray-300 text-black"
        >
          {selectedUser?.label || title}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command 
          className="rounded-lg border shadow-md"
          filter={(value, search) => {
            if (!search) return 1;
            const itemValue = value.toLowerCase();
            const searchValue = search.toLowerCase();
            return itemValue.includes(searchValue) ? 1 : 0;
          }}
        >
          <div className="flex items-center border-b px-3">
            <CommandInput
              value={inputValue}
              placeholder={placeholder}
              onValueChange={handleSearch}
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              autoFocus
            />
          </div>
          <CommandList>
            <CommandEmpty className="py-6 text-center text-sm">
              {search && localOptions.length == 0 ? notFound : <Loader2 className="w-4 h-4 animate-spin mx-auto" />}
            </CommandEmpty>
            <CommandGroup>
              <ScrollArea className="h-[200px]">
                {localOptions.map((option: DropdownUser) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => handleSelect(option)}
                    className="cursor-pointer w-full"
                  >
                    {
                      option.thumbnail && (
                        <Avatar className="w-4 h-4">
                          <AvatarImage src={option.thumbnail} />
                          <AvatarFallback>{option.label.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )
                    }
                    {
                      !option.thumbnail && (
                        <Avatar className="w-4 h-4">
                          <AvatarFallback>{option.label.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )
                    }
                    <div className="flex flex-col">
                      <p className="text-sm font-medium">{option.label}</p>
                      <p className="text-xs text-gray-500">{option.email}</p>
                    </div>
                    <Check
                      className={cn(
                        "ml-auto",
                        selectedUser?.value == option.value
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </ScrollArea>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

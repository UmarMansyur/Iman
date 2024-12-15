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
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { DropdownOptions } from "@/lib/definitions";
import * as _ from "lodash";
import { Button } from "../ui/button";

export type SelectDebounceProps = {
  title: string;
  placeholder: string;
  notFound: string;
  options: DropdownOptions[];
  keyword?: string;
  searchData: (query: string) => Promise<void>;
  choiced: React.Dispatch<React.SetStateAction<DropdownOptions | null>>;
  onSearch?: (value: string) => void;
  className?: string
};

export default function SelectOption({
  options,
  placeholder,
  notFound = "Tidak ada data yang ditemukan...",
  title = "Pilih data...",
  searchData,
  choiced,
  onSearch,
  className = "col-span-3"
}: SelectDebounceProps) {
  const [selectedUser, setSelectedUser] = useState<DropdownOptions | null>(
    null
  );
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [localOptions, setLocalOptions] = useState<DropdownOptions[]>(options);

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

  const handleSelect = (value: DropdownOptions) => {
    setSelectedUser(value);
    choiced(value);
    setOpen(false);
  };

  const handleSearch = (value: string) => {
    setInputValue(value);
    debouncedSearchData(value);
  };

  useEffect(() => {
    setLocalOptions(options);
  }, [options]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className={className} name="user_id">
        <Button
          variant="ghost"
          role="combobox"
          className="justify-between col-span-3 bg-white border border-gray-300 text-black"
        >
          {selectedUser?.label || title}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0 justify-between">
        <Command filter={(value, search) => {
          if (!search) return 1;
          const itemValue = value.toLowerCase();
          const searchValue = search.toLowerCase();
          return itemValue.includes(searchValue) ? 1 : 0;
        }}>
          <CommandInput
            value={inputValue}
            placeholder={placeholder}
            onValueChange={handleSearch}
            autoFocus
          />
          <CommandList>
            <CommandEmpty className="p-2 text-xs">
              {notFound}
            </CommandEmpty>
            <CommandGroup>
              <ScrollArea className="h-[200px]">
                {localOptions.map((option: DropdownOptions) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => handleSelect(option)}
                    className="cursor-pointer w-full"
                  >
                    {option.label}
                    <Check
                      className={cn(
                        "ml-auto",
                        selectedUser?.value === option.value
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

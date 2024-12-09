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
import { useEffect, useState } from "react";
import { DropdownOptions } from "@/lib/definitions";
import * as _ from "lodash";
import { Button } from "../ui/button";

export type SelectDebounceProps = {
  title: string;
  placeholder: string;
  notFound: string;
  options: DropdownOptions[];
  keyword: string;
  searchData: (query: string) => Promise<void>;
  // choiced is state to set selected value
  choiced: React.Dispatch<React.SetStateAction<DropdownOptions | null>>;
};

export default function SelectOption({
  options,
  placeholder,
  notFound = "Tidak ada data yang ditemukan...",
  title = "Pilih data...",
  keyword,
  searchData,
  choiced,
}: SelectDebounceProps) {
  const [selectedUser, setSelectedUser] = useState<DropdownOptions | null>(
    null
  );
  const [open, setOpen] = useState(false);
  const debouncedSearchData = _.debounce(searchData, 500);
  const handleSelect = (value: DropdownOptions) => {
    setSelectedUser(value);
    choiced(value);
    setOpen(false);
    return value;
  };

  useEffect(() => {
    debouncedSearchData(keyword);
  }, [keyword]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
      <PopoverContent className="w-full p-0 justify-between">
        <Command>
          <CommandInput
            placeholder={placeholder}
            onValueChange={(value) => {
              debouncedSearchData(value);
            }}
          />
          <CommandList>
            <CommandEmpty>{notFound}</CommandEmpty>
            <CommandGroup>
              <ScrollArea className="h-[200px]">
                {options.map((option: DropdownOptions) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleSelect(option)}
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

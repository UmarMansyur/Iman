/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";

export function useCreateTransactionService() {
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await axios.post("/api/transaction-service", data);
      return response.data;
    },
  });
}

export function useServices(factory_id: number) {
  return useQuery({
    queryKey: ["services", factory_id],
    queryFn: async () => {
      const response = await axios.get(`/api/service?factory_id=${factory_id}`);
      return response.data;
    },
  });
}

export function useBuyers(factory_id: number) {
  return useQuery({
    queryKey: ["buyers", factory_id],
    queryFn: async () => {
      const response = await axios.get(`/api/buyer?factory_id=${factory_id}`);
      return response.data;
    },
  });
}
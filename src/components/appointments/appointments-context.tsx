"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type {
  MockPatient,
  MockProcedure,
  MockDentist,
} from "@/lib/mock-appointments-data";

interface MetaContextValue {
  patients: MockPatient[];
  procedures: MockProcedure[];
  dentists: MockDentist[];
  getPatient: (id: string) => MockPatient | undefined;
  getProcedure: (id: string) => MockProcedure | undefined;
  getDentist: (id: string) => MockDentist | undefined;
}

const Ctx = createContext<MetaContextValue | null>(null);

export function AppointmentsMetaProvider({
  children,
  patients,
  procedures,
  dentists,
}: {
  children: ReactNode;
  patients: MockPatient[];
  procedures: MockProcedure[];
  dentists: MockDentist[];
}) {
  const value = useMemo<MetaContextValue>(() => {
    const pMap = new Map(patients.map((p) => [p.id, p]));
    const procMap = new Map(procedures.map((p) => [p.id, p]));
    const dMap = new Map(dentists.map((d) => [d.id, d]));
    return {
      patients,
      procedures,
      dentists,
      getPatient: (id) => pMap.get(id),
      getProcedure: (id) => procMap.get(id),
      getDentist: (id) => dMap.get(id),
    };
  }, [patients, procedures, dentists]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppointmentsMeta(): MetaContextValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAppointmentsMeta usado fora do AppointmentsMetaProvider");
  return v;
}

import { Box, SimpleGrid } from "@chakra-ui/react";
import CheckTable from "views/admin/teacherview/components/CheckTable";
import { columnsDataCheck } from "views/admin/timetable/variable/ColumData";
import React from "react";

export default function InfraTable() {
  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <SimpleGrid
        mb="20px"
        columns={{ sm: 1, md: 1 }}
        spacing={{ base: "20px", xl: "20px" }}
      >
        <CheckTable columnsData={columnsDataCheck} />
      </SimpleGrid>
    </Box>
  );
}

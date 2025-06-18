import { Box, SimpleGrid } from "@chakra-ui/react";
import CheckTable from "views/admin/reports/components/CheckTable";
import { columnsDataCheck } from "views/admin/reports/variables/columnsData";
import tableDataCheck from "views/admin/reports/variables/tableDataCheck.json";
import React from "react";

export default function Reports() {
  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <SimpleGrid
        mb="20px"
        columns={{ sm: 1, md: 1 }}
        spacing={{ base: "20px", xl: "20px" }}
      >
        <CheckTable columnsData={columnsDataCheck} tableData={tableDataCheck} />
      </SimpleGrid>
    </Box>
  );
}

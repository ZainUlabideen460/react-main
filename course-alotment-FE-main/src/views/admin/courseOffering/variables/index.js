import { Box, SimpleGrid } from "@chakra-ui/react";
import CheckTable from "views/admin/courseOffering/components/CheckTable";
import { columnsDataCheck } from "views/admin/courseOffering/variables/columnsData";
import React from "react";

export default function CourseOffering() {
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

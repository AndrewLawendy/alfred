import { SimpleGrid, Skeleton } from "@chakra-ui/react";

type LoadingProps = {
  message: string;
  columns?: number;
};

const Loading = ({ message, columns = 3 }: LoadingProps) => (
  <SimpleGrid role="status" aria-label={message} columns={columns} spacing={2}>
    {Array.from({ length: columns * 2 }, (_, index) => (
      <Skeleton key={index} height="170px" borderRadius="card" />
    ))}
  </SimpleGrid>
);

export default Loading;

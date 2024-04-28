import {
  Box,
  Text,
  Flex,
} from '@chakra-ui/react';
import { displayTimeStamp } from '../utils/utils';

export function Message(props) {
  const { message, isOwnMessage } = props;

  return (
    <Flex flexDirection="column" alignItems={isOwnMessage ? 'flex-end' : 'flex-start'}>
      {!isOwnMessage && 
        <Text fontSize="sm" mb={1}>
          {message.author}
        </Text>
      }
      <Box
        borderRadius="md"
        py={2} px={4}
        color="white"
        maxWidth="75%"
        bg={isOwnMessage ? 'blue.300' : 'green.300'}
        alignSelf={isOwnMessage ? 'flex-end' : 'flex-start'}
      >
        <Text fontSize="sm">{message.content}</Text>
      </Box>
      <Text fontSize="2xs" mx={1}> {displayTimeStamp(message.createdAt)} </Text>
    </Flex>
  );
}

import {
  Icon,
  Text,
  Flex,
} from '@chakra-ui/react';
import { FaStar, FaStarHalfAlt, FaRegStar  } from "react-icons/fa";

export function Review(props) {
  const { rating, review_count, popup } = props;

  /*
  Query:
  given an integer, how to generate that many amount of components in react?

  Response:
  import React from 'react';

  const MyComponent = () => {
    // Your integer value
    const n = 5;

    // Generate components based on the integer value
    const components = Array.from({ length: n }, (_, index) => <YourComponent key={index} />);

    return (
      <div>
        {components}
      </div>
    );
  };

  // Your individual component
  const YourComponent = () => {
    return <div>Your Component</div>;
  };

  export default MyComponent;
  */

  return (
    <Flex align='center'> 
      {Array.from({length:rating}, (_, index) => (
        <Icon as={FaStar} key={index} mr={2} color='yellow.200' /> 
      ))}
      {rating % 1 === 0.5 && <Icon as={FaStarHalfAlt} mr={2} color='yellow.200' /> }
      {Array.from({length: Math.floor(5 - rating)}, (_,index) => (
        <Icon as={FaRegStar} key={index} mr={2} color='yellow.200' /> 
      ))}
      <Text fontSize="xs" as="div" my={2} style={{transform: popup ? "translateY(2px)" : "none"}}> {review_count} reviews </Text>
    </Flex>
  );
}

export default Review
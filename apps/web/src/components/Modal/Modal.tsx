import {
  Modal as ChakraModal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
} from '@chakra-ui/react';
import React, { useRef } from 'react';

interface ModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  content: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  title,
  isOpen,
  onClose,
  content,
}) => {
  const btnRef = useRef(null);

  return (
    <ChakraModal
      onClose={onClose}
      finalFocusRef={btnRef}
      isOpen={isOpen}
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>{content}</ModalBody>
        <ModalFooter>
          <Button
            variant="solid"
            bg="black"
            _hover={{ bg: 'gray.600' }}
            color="white"
            onClick={onClose}
            mr={[0, '4']}
            mb={['4', 4]}
            w={['full', 'auto']}
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </ChakraModal>
  );
};

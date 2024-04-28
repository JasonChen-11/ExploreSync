// 2FA implmentation was inspired by this tutorial: https://www.youtube.com/watch?v=fBWwx45_nIo

import React, { useState } from 'react';
import { 
  Input,
  Text,
  Button, 
  Flex,
  Image, 
  Modal, 
  ModalOverlay, 
  ModalContent, 
  ModalHeader, 
  ModalCloseButton, 
  ModalBody, 
  AlertDialog, 
  AlertDialogOverlay, 
  AlertDialogContent, 
  AlertDialogHeader, 
  AlertDialogCloseButton, 
  AlertDialogBody, 
  AlertDialogFooter,
  useToast,
  MenuItem
} from '@chakra-ui/react';
import { enable2FA, verify2FA, disable2FA } from "../api/api.mjs";
import { showToast } from "../utils/utils.js";

export function TwoFAButton(props) {
  const { user } = props;
  const toast = useToast();
  const [qrCode, setQRCode] = useState(null);
  const [is2FAEnabled, setIs2FAEnabled] = useState(user.user2FAEnabled);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [token, setToken] = useState('');
  const [isTokenInvalid, setIsTokenInvalid] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  
  const toggle2FA = async () => {
    try {
      if (is2FAEnabled) {
        setIsAlertOpen(true);
      } else {
        const res = await enable2FA();
        if (res && res.success) {
          setQRCode(res.qrCode);
          setIsModalOpen(true);
        }
      }
    } catch (error) {
      console.error('Error toggling 2FA: ', error);
    }
  };

  const verifyAndEnable2FA = async () => {
    try {
      const res = await verify2FA(token);
      if (res && res.success) {
        setIs2FAEnabled(true);
        setIsModalOpen(false);
        showToast(toast, true, 'Two-Factor Authentication enabled successfully');
      } else {
        setIsTokenInvalid(true);
      }
    } catch (error) {
      console.error('Error verifying token: ', error);
    }
  };

  const closeAlert = () => {
    setIsAlertOpen(false);
  };

  const handleDisable2FA = async () => {
    setIsAlertOpen(false);

    try {
      const res = await disable2FA();
      if (res && res.success) {
        setIs2FAEnabled(false);
        showToast(toast, true, 'Two-Factor Authentication is now disabled');
      }
    } catch (error) {
      console.error('Error disabling 2FA: ', error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setToken('');
    setIsTokenInvalid(false);
  };

  return (
    <>
      <MenuItem onClick={toggle2FA}> {is2FAEnabled ? 'Disable 2FA' : 'Enable 2FA'}  </MenuItem>

      <AlertDialog isOpen={isAlertOpen} onClose={closeAlert}>
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader>Disable 2FA</AlertDialogHeader>
          <AlertDialogCloseButton />
          <AlertDialogBody>
            Are you sure you want to disable Two-Factor Authentication?
            You will have to generate a new QR code the next time you want to enable it again.
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button onClick={closeAlert}>
              Cancel
            </Button>
            <Button onClick={handleDisable2FA} colorScheme="red" ml={3}>
              Disable
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {qrCode && (
        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Enable 2FA</ModalHeader>
            <ModalCloseButton />
            <ModalBody my={4}>
              <Flex direction="column" alignItems="center">
                <Image src={qrCode} alt="QR Code" mb={4} />
              </Flex>
              <Text mb={4}>Scan this QR code using your authenticator app (Google Authenticator, Microsoft Authenticator, etc...)</Text>
              <Text>Enter the verification token from your authenticator app:</Text>
              <Input
                type="number"
                placeholder="Enter token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                isInvalid={isTokenInvalid}
                mt={4}
                mb={2}
              />
              {isTokenInvalid && (
                <Text color="red.500" fontSize="sm">
                  Invalid token. Please try again.
                </Text>
              )}
              <Button onClick={verifyAndEnable2FA} mt={4} colorScheme="green">
                Verify and Enable 2FA
              </Button>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </>
  );
}

export default TwoFAButton
import { useTranslation } from 'react-i18next';
import {
    Icon,
    Link,
    ListItem,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    OrderedList,
} from '@chakra-ui/react';
import { MdOpenInNew } from 'react-icons/md';

const TermsAndConditionsModal = (props: { isOpen: boolean; onClose: () => void }) => {
    const { isOpen, onClose } = props;
    const { t } = useTranslation();

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>{t('header.download.termsAndConditions')}</ModalHeader>
                <ModalCloseButton />

                <ModalBody>
                    <OrderedList>
                        <ListItem>
                            The layout of the elements on the signage or rail map, is designed by{' '}
                            <Link color="teal.500" href="https://www.shmetro.com/" isExternal={true}>
                                Shanghai Shentong Metro Group <Icon as={MdOpenInNew} />
                            </Link>
                            {', '}
                            <Link color="teal.500" href="https://www.gzmtr.com/" isExternal={true}>
                                Guangzhou Metro Group <Icon as={MdOpenInNew} />
                            </Link>
                            {' or '}
                            <Link color="teal.500" href="https://www.mtr.com.hk/" isExternal={true}>
                                MTR Corporation <Icon as={MdOpenInNew} />
                            </Link>
                            , depending on your selection. You shall grant appropriate permit or license from the
                            relevant company above before using the generated images for commercial purposes, if it is
                            required to do so.
                        </ListItem>
                        <ListItem>
                            The elements including shapes and lines on the image are drawn by{' '}
                            <Link color="teal.500" href="https://www.github.com/thekingofcity" isExternal={true}>
                                thekingofcity <Icon as={MdOpenInNew} />
                            </Link>
                            {' and '}
                            <Link color="teal.500" href="https://www.github.com/wongchito" isExternal={true}>
                                Chito Wong <Icon as={MdOpenInNew} />
                            </Link>
                            , based on the design standards or rules of the companies listed above. You may use them for
                            any purposes, but it is recommended to state the name and the link of software alongside.
                        </ListItem>
                        <ListItem>
                            Due to copyright, licensing and other legal restrictions, Rail Map Painter uses{' '}
                            <Link color="teal.500" href="https://github.com/ButTaiwan/genyo-font" isExternal={true}>
                                GenYoMin provided by ButTaiwan <Icon as={MdOpenInNew} />
                            </Link>
                            , and Vegur instead of MTRSung and Myriad Pro respectively to display and generate MTR-style
                            signage. You shall grant appropriate permit or license from the manufacturers before using
                            those generated images for commercial purposes.
                        </ListItem>
                        <ListItem>
                            The exported images in PNG or SVG format may be modified, published, or used for other
                            purposes except commercial use, under the conditions above.
                        </ListItem>
                        <ListItem>
                            All flag emojis shown on Windows platforms are designed by{' '}
                            <Link color="teal.500" href="https://openmoji.org/" isExternal={true}>
                                OpenMoji <Icon as={MdOpenInNew} />
                            </Link>{' '}
                            – the open-source emoji and icon project. License:
                            <Link
                                color="teal.500"
                                href="https://creativecommons.org/licenses/by-sa/4.0/"
                                isExternal={true}
                            >
                                CC BY-SA 4.0 <Icon as={MdOpenInNew} />
                            </Link>
                        </ListItem>
                        <ListItem>
                            We reserve the rights, without prior notice, to modify, add, or remove these terms.
                        </ListItem>
                    </OrderedList>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default TermsAndConditionsModal;

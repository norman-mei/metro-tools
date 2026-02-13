import {
    Badge,
    Box,
    Button,
    HStack,
    Kbd,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Select,
    StackDivider,
    Switch,
    SystemStyleObject,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    VStack,
} from '@chakra-ui/react';
import { useRmgColourMode } from '@railmapgen/rmg-components';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MdArrowBack, MdArrowDownward, MdArrowForward, MdArrowUpward, MdReadMore } from 'react-icons/md';
import { StationCity } from '../../constants/constants';
import { useRootDispatch, useRootSelector } from '../../redux';
import {
    setAutoChangeStationType,
    setAutoParallel,
    setDisableWarningChangeType,
    setGridLines,
    setKeepLastPath,
    setPredictNextNode,
    setRandomStationsNames,
    setSnapLines,
    setThemeMode,
} from '../../redux/app/app-slice';
import { isMacClient } from '../../util/helpers';
import { MasterManager } from './master-manager';
import { ChangeTypeModal } from './procedures/change-type-modal';
import { RemoveLinesWithSingleColorModal } from './procedures/remove-lines-with-single-color-modal';
import { ScaleNodesModal } from './procedures/scale-nodes-modal';
import { TranslateNodesModal } from './procedures/translate-nodes-modal';
import { UpdateColorModal } from './procedures/update-color-modal';
import { StatusSection } from './status-section';

const procedureButtonStyle: SystemStyleObject = {
    width: '100%',
    justifyContent: 'space-between',
};

const macKeyStyle: SystemStyleObject = {
    fontFamily: '-apple-system',
};

type ThemeMode = 'light' | 'dark' | 'system';

const SettingsModal = (props: { isOpen: boolean; onClose: () => void }) => {
    const { isOpen, onClose } = props;
    const {
        preference: {
            autoParallel,
            keepLastPath,
            themeMode,
            randomStationsNames,
            gridLines,
            snapLines,
            predictNextNode,
            autoChangeStationType,
            disableWarning: { changeType: disableWarningChangeType },
        },
    } = useRootSelector(state => state.app);
    const dispatch = useRootDispatch();
    const { t } = useTranslation();
    const { setColourMode } = useRmgColourMode();

    const [isTranslateNodesOpen, setIsTranslateNodesOpen] = React.useState(false);
    const [isScaleNodesOpen, setIsScaleNodesOpen] = React.useState(false);
    const [isChangeTypeOpen, setIsChangeTypeOpen] = React.useState(false);
    const [isRemoveLinesWithSingleColorOpen, setIsRemoveLinesWithSingleColorOpen] = React.useState(false);
    const [isUpdateColorOpen, setIsUpdateColorOpen] = React.useState(false);
    const [isManagerOpen, setIsManagerOpen] = React.useState(false);

    const handleRandomStationNamesChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        dispatch(setRandomStationsNames(event.target.value as 'none' | StationCity));
    };
    const handleThemeModeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const mode = event.target.value as ThemeMode;
        dispatch(setThemeMode(mode));
        setColourMode(mode);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside" trapFocus={false}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>{t('header.settings.title')}</ModalHeader>
                <ModalCloseButton />

                <ModalBody>
                    <VStack divider={<StackDivider borderColor="gray.200" />}>
                        <StatusSection />
                        <Box width="100%" mb="3">
                            <Text as="b" fontSize="xl">
                                {t('header.settings.preference.title')}
                            </Text>
                            <VStack spacing="0" mt="3" align="stretch">
                                <HStack mb="1">
                                    <Text flex="1">{t('header.settings.preference.keepLastPath')}</Text>
                                    <Switch
                                        isChecked={keepLastPath}
                                        onChange={({ target: { checked } }) => dispatch(setKeepLastPath(checked))}
                                    />
                                </HStack>
                                <HStack mb="1">
                                    <Text flex="1">{t('header.settings.preference.theme.title')}</Text>
                                    <Select
                                        id="theme_mode_select"
                                        size="sm"
                                        width="160px"
                                        ml="1"
                                        value={themeMode}
                                        onChange={handleThemeModeChange}
                                    >
                                        <option value="light">{t('header.settings.preference.theme.light')}</option>
                                        <option value="dark">{t('header.settings.preference.theme.dark')}</option>
                                        <option value="system">{t('header.settings.preference.theme.system')}</option>
                                    </Select>
                                </HStack>
                                <HStack mb="1">
                                    <Text>{t('header.settings.preference.autoParallel')}</Text>
                                    <Badge ml="auto" colorScheme="green">
                                        New
                                    </Badge>
                                    <Switch
                                        ml="1"
                                        isChecked={autoParallel}
                                        onChange={({ target: { checked } }) => dispatch(setAutoParallel(checked))}
                                    />
                                </HStack>
                                <HStack mb="1">
                                    <Text flex="1">{t('header.settings.preference.randomStationNames.title')}</Text>
                                    <Badge ml="auto" colorScheme="green">
                                        New
                                    </Badge>
                                    <Select
                                        size="xs"
                                        width="auto"
                                        ml="1"
                                        value={randomStationsNames}
                                        onChange={handleRandomStationNamesChange}
                                    >
                                        <option value="none">
                                            {t('header.settings.preference.randomStationNames.none')}
                                        </option>
                                        <option value={StationCity.Shmetro}>
                                            {t(`header.settings.preference.randomStationNames.${StationCity.Shmetro}`)}
                                        </option>
                                        <option value={StationCity.Bjsubway}>
                                            {t(`header.settings.preference.randomStationNames.${StationCity.Bjsubway}`)}
                                        </option>
                                    </Select>
                                </HStack>
                                <HStack mb="1">
                                    <Text flex="1">{t('header.settings.preference.gridline')}</Text>
                                    <Switch
                                        isChecked={gridLines}
                                        onChange={({ target: { checked } }) => dispatch(setGridLines(checked))}
                                    />
                                </HStack>
                                <HStack mb="1">
                                    <Text flex="1">{t('header.settings.preference.snapline')}</Text>
                                    <Switch
                                        isChecked={snapLines}
                                        onChange={({ target: { checked } }) => dispatch(setSnapLines(checked))}
                                    />
                                </HStack>
                                <HStack mb="1">
                                    <Text flex="1">{t('header.settings.preference.predictNextNode')}</Text>
                                    <Switch
                                        isChecked={predictNextNode}
                                        onChange={({ target: { checked } }) => dispatch(setPredictNextNode(checked))}
                                    />
                                </HStack>
                                <HStack mb="1">
                                    <Text flex="1">{t('header.settings.preference.autoChangeStationType')}</Text>
                                    <Switch
                                        isChecked={autoChangeStationType}
                                        onChange={({ target: { checked } }) =>
                                            dispatch(setAutoChangeStationType(checked))
                                        }
                                    />
                                </HStack>
                                <HStack mb="1">
                                    <Text flex="1">{t('header.settings.preference.disableWarningChangeType')}</Text>
                                    <Switch
                                        isChecked={disableWarningChangeType}
                                        onChange={({ target: { checked } }) =>
                                            dispatch(setDisableWarningChangeType(checked))
                                        }
                                    />
                                </HStack>
                            </VStack>
                        </Box>

                        <Box width="100%" mb="3">
                            <Text as="b" fontSize="xl">
                                {t('header.settings.procedures.title')}
                            </Text>
                            <Box mt="3">
                                <Button
                                    sx={procedureButtonStyle}
                                    rightIcon={<MdReadMore />}
                                    onClick={() => setIsTranslateNodesOpen(true)}
                                >
                                    {t('header.settings.procedures.translate.title')}
                                </Button>
                                <TranslateNodesModal
                                    isOpen={isTranslateNodesOpen}
                                    onClose={() => setIsTranslateNodesOpen(false)}
                                />

                                <Button
                                    sx={procedureButtonStyle}
                                    rightIcon={<MdReadMore />}
                                    onClick={() => setIsScaleNodesOpen(true)}
                                >
                                    {t('header.settings.procedures.scale.title')}
                                </Button>
                                <ScaleNodesModal isOpen={isScaleNodesOpen} onClose={() => setIsScaleNodesOpen(false)} />

                                <Button
                                    sx={procedureButtonStyle}
                                    rightIcon={<MdReadMore />}
                                    onClick={() => setIsChangeTypeOpen(true)}
                                >
                                    {t('header.settings.procedures.changeType.title')}
                                </Button>
                                <ChangeTypeModal
                                    isOpen={isChangeTypeOpen}
                                    onClose={() => setIsChangeTypeOpen(false)}
                                    isSelect={false}
                                />

                                <Button
                                    sx={procedureButtonStyle}
                                    rightIcon={<MdReadMore />}
                                    onClick={() => setIsRemoveLinesWithSingleColorOpen(true)}
                                >
                                    {t('header.settings.procedures.removeLines.title')}
                                </Button>
                                <RemoveLinesWithSingleColorModal
                                    isOpen={isRemoveLinesWithSingleColorOpen}
                                    onClose={() => setIsRemoveLinesWithSingleColorOpen(false)}
                                />

                                <Button
                                    sx={procedureButtonStyle}
                                    rightIcon={<MdReadMore />}
                                    onClick={() => setIsUpdateColorOpen(true)}
                                >
                                    {t('header.settings.procedures.updateColor.title')}
                                </Button>
                                <UpdateColorModal
                                    isOpen={isUpdateColorOpen}
                                    onClose={() => setIsUpdateColorOpen(false)}
                                />

                                <Button
                                    sx={procedureButtonStyle}
                                    rightIcon={<MdReadMore />}
                                    onClick={() => setIsManagerOpen(true)}
                                >
                                    {t('header.settings.procedures.masterManager.title')}
                                </Button>
                                <MasterManager isOpen={isManagerOpen} onClose={() => setIsManagerOpen(false)} />
                            </Box>
                        </Box>

                        <Box width="100%" mb="3">
                            <Text as="b" fontSize="xl">
                                {t('header.settings.shortcuts.title')}
                            </Text>
                            <Box mt="3">
                                <Table>
                                    <Thead>
                                        <Tr>
                                            <Th>{t('header.settings.shortcuts.keys')}</Th>
                                            <Th>{t('header.settings.shortcuts.description')}</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        <Tr>
                                            <Td>
                                                <Kbd>f</Kbd>
                                            </Td>
                                            <Td>{t('header.settings.shortcuts.f')}</Td>
                                        </Tr>
                                        <Tr>
                                            <Td>
                                                <Kbd>s</Kbd>
                                            </Td>
                                            <Td>{t('header.settings.shortcuts.s')}</Td>
                                        </Tr>
                                        <Tr>
                                            <Td>
                                                <Kbd>c</Kbd>
                                            </Td>
                                            <Td>{t('header.settings.shortcuts.c')}</Td>
                                        </Tr>
                                        <Tr>
                                            <Td>
                                                <Box display="flex" flexDirection="row">
                                                    <MdArrowUpward />
                                                    <MdArrowBack />
                                                    <MdArrowForward />
                                                    <MdArrowDownward />
                                                </Box>
                                            </Td>
                                            <Td>{t('header.settings.shortcuts.arrows')}</Td>
                                        </Tr>
                                        <Tr>
                                            <Td>
                                                <Box display="flex" flexDirection="row">
                                                    <Kbd>i</Kbd>
                                                    <Kbd>j</Kbd>
                                                    <Kbd>k</Kbd>
                                                    <Kbd>l</Kbd>
                                                </Box>
                                            </Td>
                                            <Td>{t('header.settings.shortcuts.ijkl')}</Td>
                                        </Tr>
                                        <Tr>
                                            <Td>
                                                <Kbd>r</Kbd>
                                            </Td>
                                            <Td>{t('header.settings.shortcuts.rotate')}</Td>
                                        </Tr>
                                        <Tr>
                                            <Td>
                                                {isMacClient ? <Kbd sx={macKeyStyle}>&#8679;</Kbd> : <Kbd>shift</Kbd>}
                                            </Td>
                                            <Td>{t('header.settings.shortcuts.shift')}</Td>
                                        </Tr>
                                        <Tr>
                                            <Td>
                                                {isMacClient ? <Kbd sx={macKeyStyle}>&#8997;</Kbd> : <Kbd>alt</Kbd>}
                                            </Td>
                                            <Td>{t('header.settings.shortcuts.alt')}</Td>
                                        </Tr>
                                        <Tr>
                                            <Td>
                                                {isMacClient ? <Kbd sx={macKeyStyle}>&#9003;</Kbd> : <Kbd>delete</Kbd>}
                                            </Td>
                                            <Td>{t('header.settings.shortcuts.delete')}</Td>
                                        </Tr>
                                        <Tr>
                                            <Td>
                                                {isMacClient ? <Kbd sx={macKeyStyle}>&#8984;</Kbd> : <Kbd>ctrl</Kbd>}
                                                {' + '}
                                                <Kbd>x</Kbd>
                                            </Td>
                                            <Td>{t('header.settings.shortcuts.cut')}</Td>
                                        </Tr>
                                        <Tr>
                                            <Td>
                                                {isMacClient ? <Kbd sx={macKeyStyle}>&#8984;</Kbd> : <Kbd>ctrl</Kbd>}
                                                {' + '}
                                                <Kbd>c</Kbd>
                                            </Td>
                                            <Td>{t('header.settings.shortcuts.copy')}</Td>
                                        </Tr>
                                        <Tr>
                                            <Td>
                                                {isMacClient ? <Kbd sx={macKeyStyle}>&#8984;</Kbd> : <Kbd>ctrl</Kbd>}
                                                {' + '}
                                                <Kbd>v</Kbd>
                                            </Td>
                                            <Td>{t('header.settings.shortcuts.paste')}</Td>
                                        </Tr>
                                        <Tr>
                                            <Td>
                                                {isMacClient ? <Kbd sx={macKeyStyle}>&#8984;</Kbd> : <Kbd>ctrl</Kbd>}
                                                {' + '}
                                                <Kbd>z</Kbd>
                                            </Td>
                                            <Td>{t('header.settings.shortcuts.undo')}</Td>
                                        </Tr>
                                        <Tr>
                                            <Td>
                                                {isMacClient ? (
                                                    <>
                                                        <Kbd sx={macKeyStyle}>&#8679;</Kbd>
                                                        {' + '}
                                                        <Kbd sx={macKeyStyle}>&#8984;</Kbd>
                                                        {' + '}
                                                        <Kbd>z</Kbd>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Kbd>ctrl</Kbd> + <Kbd>y</Kbd>
                                                    </>
                                                )}
                                            </Td>
                                            <Td>{t('header.settings.shortcuts.redo')}</Td>
                                        </Tr>
                                    </Tbody>
                                </Table>
                            </Box>
                        </Box>
                    </VStack>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default SettingsModal;

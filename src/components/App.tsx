import React, { useCallback, useState } from "react";
import {
  Button,
  ChevronIcon,
  Collapse,
  Container,
  Group,
  NativeSelect,
  Radio,
  Stack,
  Text,
  Textarea,
  Title,
  UnstyledButton,
  createStyles,
  rem,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import namesByCountryMap from "../data/names-by-country.json";
import { getAppleDeviceName, testNames } from "../detector";
import { Dots } from "./Dots/Dots";

type CountryCode = keyof typeof namesByCountryMap;

const countryCodes = Object.keys(namesByCountryMap) as CountryCode[];

const useStyles = createStyles((theme) => ({
  inner: {
    position: "relative",
    zIndex: 1,
  },

  title: {
    textAlign: "center",
    fontWeight: 800,
    fontSize: rem(40),
    letterSpacing: -1,
    color: theme.colorScheme === "dark" ? theme.white : theme.black,
    marginBottom: theme.spacing.xs,
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
  },

  description: {
    textAlign: "center",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  primaryInput: {
    width: "250px",
  },

  advancedSettings: {
    color: theme.colors.blue,
    fontWeight: 600,
    fontSize: rem(14),
    display: "flex",
    alignItems: "center",
    gap: "4px",
    width: "516px",
    maxWidth: "100%",
  },

  chevronIcon: {
    width: "18px",
    height: "18px",
  },
}));

export default function App() {
  const { classes } = useStyles();

  const [isAdvancedSettingsShowed, setAdvancedSettings] = useState(false);
  const toggleAdvancedSettings = () => setAdvancedSettings((state) => !state);

  const form = useForm({
    initialValues: {
      countryCode: countryCodes[0],
      gender: "male_names" as const,
      patterns: "<name>-macbook-pro.local",
      names: namesByCountryMap[countryCodes[0]]["male_names"].join("\n"),
    },
  });

  const handleSubmit = useCallback(async () => {
    // setDetecting(true);
    const result = await testNames(
      namesByCountryMap[form.values.countryCode][form.values.gender]
    );
    console.log(result);
  }, [form]);

  return (
    <Stack mih="100%" pos="relative" py="80px" px="md" justify="center">
      <Dots style={{ left: 0, top: 0 }} />
      <Dots style={{ left: 60, top: 0 }} />
      <Dots style={{ left: 0, top: 140 }} />
      <Dots style={{ right: 0, top: 60 }} />

      <div className={classes.inner}>
        <Title className={classes.title} mb="lg">
          Can I Guess Your Name?
        </Title>

        <Container p={0} size={600}>
          <Text
            size="lg"
            mb="xl"
            color="dimmed"
            className={classes.description}
          >
            This interactive demo site illuminates how the mDNS protocol can
            potentially be exploited in a web browser to uncover sensitive user
            information such as their first name.
          </Text>
        </Container>

        <form className={classes.form} onSubmit={form.onSubmit(handleSubmit)}>
          <Group>
            <NativeSelect
              label="Name Origin"
              data={countryCodes.map((it) => ({
                value: it,
                label: `${namesByCountryMap[it].emoji} ${namesByCountryMap[it].name}`,
              }))}
              error={form.errors.countryCode}
              className={classes.primaryInput}
              {...form.getInputProps("countryCode")}
            />
            <NativeSelect
              label="Name Gender"
              data={[
                { value: "male_names", label: "🙎‍♂️ Male" },
                { value: "female_names", label: "🙎‍♀️ Female" },
                { value: "neutral", label: "👤 Neutral" },
              ]}
              className={classes.primaryInput}
              error={form.errors.gender}
              {...form.getInputProps("gender")}
            />
          </Group>

          <UnstyledButton
            onClick={toggleAdvancedSettings}
            mt="sm"
            className={classes.advancedSettings}
          >
            <Text>Advanced Settings</Text>
            <ChevronIcon className={classes.chevronIcon} />
          </UnstyledButton>

          <Collapse in={isAdvancedSettingsShowed}>
            <Radio.Group
              name="detectionMetthod"
              label="Detection Method"
              description="Availability depends on the browser"
              mt="xl"
              value="webrtc"
            >
              <Group mt="xs">
                <Radio value="webrtc" label="WebRTC" />
                <Radio value="fetch" label="fetch" />
                <Radio value="iframe" label="iframe" disabled />
              </Group>
            </Radio.Group>

            <Textarea
              autosize
              w="516px"
              mt="xl"
              label="mDNS Patterns"
              placeholder="<name>-macbook-pro.local"
              {...form.getInputProps("patterns")}
            />

            <UnstyledButton
              onClick={() => form.reset()}
              mt="xs"
              className={classes.advancedSettings}
            >
              <Text>Reset patterns</Text>
            </UnstyledButton>

            <Textarea
              w="516px"
              rows={10}
              mt="xl"
              label="Names To Check"
              placeholder={"John\nKevin\nAlex"}
              minRows={10}
              {...form.getInputProps("names")}
            />
          </Collapse>

          <Button
            mt="xl"
            type="submit"
            size="lg"
            loaderPosition="right"
            loading={true}
          >
            Guess My Name
          </Button>
        </form>
      </div>
    </Stack>
  );
}

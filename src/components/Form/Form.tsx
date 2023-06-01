import {
  Button,
  ChevronIcon,
  Collapse,
  Group,
  NativeSelect,
  Radio,
  Text,
  Textarea,
  UnstyledButton,
  createStyles,
  rem,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import nameMap from "../../data/names-by-country.json";
import { useLocalStorageFormCache } from "../../hooks/form";
import {
  getPossibleAppleDeviceMdnsBaseNames,
  isGecko,
} from "../../detection/device";
import { useEffect, useState } from "react";

export const NAME_PLACEHOLDER_TOKEN = "<name>";
export type CountryCode = keyof typeof nameMap;
export type FormData = {
  countryCode: CountryCode;
  names: string;
  patterns: string;
  gender: "male_names" | "female_names";
  detectionMethod: "fetch" | "webrtc" | "iframe";
};

const countryCodes = Object.keys(nameMap) as CountryCode[];

const defaultCountryCode = countryCodes[0];
const defaultGender = "male_names";
const deviceBaseNames = getPossibleAppleDeviceMdnsBaseNames();

const initialValues: FormData = {
  countryCode: defaultCountryCode,
  names: "",
  gender: defaultGender,
  patterns: deviceBaseNames
    .flatMap((deviceName) => [
      `${NAME_PLACEHOLDER_TOKEN}s-${deviceName}.local`,
      `${deviceName}-${NAME_PLACEHOLDER_TOKEN}.local`,
      `${deviceName}.local`,
    ])
    .join("\n"),
  detectionMethod: isGecko() ? "iframe" : "fetch",
};

const useStyles = createStyles((theme) => ({
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

type Props = {
  isLoading: boolean;
  onSubmit(data: FormData): unknown;
  advancedSettingsOpened?: boolean;
};

export function Form({
  onSubmit,
  isLoading,
  advancedSettingsOpened = false,
}: Props) {
  const form = useForm({ initialValues });
  useLocalStorageFormCache(form, "user-form");

  const { classes } = useStyles();
  const [isAdvancedSettingsShowed, setAdvancedSettings] = useState(
    advancedSettingsOpened
  );
  const toggleAdvancedSettings = () => setAdvancedSettings((state) => !state);

  useEffect(() => {
    const { countryCode, gender } = form.values;
    const newNames = nameMap[countryCode][gender].join("\n");

    form.setFieldValue("names", newNames);
  }, [form.values.countryCode, form.values.gender]);

  return (
    <form className={classes.form} onSubmit={form.onSubmit(onSubmit)}>
      <Group>
        <NativeSelect
          label="Name Origin"
          data={countryCodes.map((it) => ({
            value: it,
            label: `${nameMap[it].emoji} ${nameMap[it].name}`,
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
            { value: "neutral", label: "👤 Neutral", disabled: true },
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
          name="detectionMethod"
          label="Detection Method"
          description="Availability depends on the browser"
          mt="xl"
          {...form.getInputProps("detectionMethod")}
        >
          <Group mt="xs">
            <Radio
              value="fetch"
              label="fetch"
              description="Safari or Chromium"
            />
            <Radio value="webrtc" label="WebRTC" description="Chromium only" />
            <Radio value="iframe" label="iframe" description="Firefox only" />
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
          disabled={!form.values.patterns.includes("<name>")}
          {...form.getInputProps("names")}
        />
      </Collapse>

      <Button
        mt="xl"
        type="submit"
        size="lg"
        loaderPosition="right"
        loading={isLoading}
      >
        Guess My Name
      </Button>
    </form>
  );
}

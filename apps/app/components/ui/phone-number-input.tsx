"use client"

import * as React from "react"

// Utilities
import { cn } from "@/lib/utils"

// Lucide Icons
import { ChevronsUpDown, Check, Earth } from "lucide-react"

// Shadcn/ui Components
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

// React Phone Number Input
import * as RPNInput from "react-phone-number-input"
import flags from "react-phone-number-input/flags"

// Types
interface PhoneNumberInputProps {
  value: string
  onChange: (value: string) => void
}

interface CountrySelectProps {
  disabled?: boolean
  value: RPNInput.Country | undefined
  onChange: (value: RPNInput.Country) => void
}

// Components
const HiddenCountrySelect = () => null

const FlagComponent: React.FC<RPNInput.FlagProps> = ({ country, countryName }) => {
  const Flag = country && flags[country] ? flags[country] : null
  return (
    <span className="w-5 overflow-hidden rounded-sm hidden">
      {Flag ? <Flag title={countryName} /> : <Earth aria-hidden="true" />}
    </span>
  )
}

const PhoneNumberInputField = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <Input
      ref={ref}
      data-slot="phone-input"
      className={cn("h-9 rounded-l-none border-l-0 shadow-none focus-visible:z-10", className)}
      {...props}
    />
  )
)

const CountrySelect: React.FC<CountrySelectProps> = ({ disabled, value, onChange }) => {
  const [open, setOpen] = React.useState(false)
  const buttonRef = React.useRef<HTMLButtonElement>(null)
  const [countryList, setCountryList] = React.useState<Array<{ value: RPNInput.Country; label: string; code: string }>>([])

  React.useEffect(() => {
    const countries = Object.entries(RPNInput.getCountries()).map(([country, countryCode]) => ({
      value: countryCode as RPNInput.Country,
      label: countryMap[countryCode as string] || countryCode,
      code: RPNInput.getCountryCallingCode(countryCode as RPNInput.Country) || "1",
    }));
    
    countries.sort((a, b) => a.label.localeCompare(b.label));
    
    setCountryList(countries);
  
    if (!value && countries.length > 0) {
      onChange(countries.find((c) => c.value === "US")?.value || countries[0].value);
    }
  }, [value, onChange]);

  const selectedCountry = value ? countryList.find((item) => item.value === value) : null
  const Flag = value && flags[value] ? flags[value] : null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          ref={buttonRef}
          disabled={disabled}
          className="h-9 border-input bg-card text-foreground hover:bg-accent inline-flex items-center justify-center gap-2 self-stretch rounded-l-md border py-2 px-2 transition-all outline-none disabled:pointer-events-none disabled:opacity-50"
          type="button"
        >
          <span className="w-5 overflow-hidden rounded-xs ml-1">{Flag ? <Flag title={selectedCountry?.label || ""} /> : <Earth aria-hidden="true" />}</span>
          <ChevronsUpDown className="text-muted-foreground h-4 w-4" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[320px]" align="start">
        <Command>
          <CommandInput placeholder="Search country..." />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {countryList.map((country) => (
                <CommandItem
                  key={country.value}
                  value={`${country.label} ${country.value} +${country.code}`}
                  onSelect={() => {
                    onChange(country.value)
                    setOpen(false)
                    buttonRef.current?.focus()
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 overflow-hidden rounded-sm">
                      {flags[country.value] ? React.createElement(flags[country.value]!, { title: country.label }) : <Earth aria-hidden="true" />}
                    </span>
                    <span>{country.label}</span>
                    <span className="text-muted-foreground">{`+${country.code}`}</span>
                    {country.value === value && <Check className="ml-auto" aria-hidden="true"/>}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export const PhoneNumberInput = React.forwardRef<HTMLDivElement, PhoneNumberInputProps>(({ value, onChange }, ref) => {  
  const id = React.useId()
  const [phoneValue, setPhoneValue] = React.useState(value || "")
  const [country, setCountry] = React.useState<RPNInput.Country | undefined>(undefined)

  React.useEffect(() => {
    if (value !== phoneValue) {
      setPhoneValue(value)
    }
  }, [value, phoneValue])

  const handleCountryChange = (newCountry: RPNInput.Country) => {
    setCountry(newCountry)
    const callingCode = RPNInput.getCountryCallingCode(newCountry)
    const newValue = `+${callingCode}`
    setPhoneValue(newValue)
    onChange?.(newValue as string)
  }

  const handleInputChange = (newValue: string) => {
    setPhoneValue(newValue ?? "")
    onChange?.(newValue)
  }

  return (
    <div className="*:not-first:mt-2" dir="ltr" ref={ref}>
      <div className="flex">
        <CountrySelect value={country} onChange={handleCountryChange} disabled={false} />
        <RPNInput.default
          className="flex flex-1 rounded-md"
          international
          flagComponent={FlagComponent}
          countrySelectComponent={HiddenCountrySelect}
          inputComponent={PhoneNumberInputField}
          id={id}
          placeholder="+1 999 999 9999"
          value={phoneValue ? phoneValue : "+1"}
          onChange={handleInputChange}
          country={country}
        />
      </div>
    </div>
  )
})

const countryMap: Record<string, string> = {
    "AC": "Ascension Island",
    "AD": "Andorra",
    "AE": "United Arab Emirates",
    "AF": "Afghanistan",
    "AG": "Antigua and Barbuda",
    "AI": "Anguilla",
    "AL": "Albania",
    "AM": "Armenia",
    "AO": "Angola",
    "AR": "Argentina",
    "AS": "American Samoa",
    "AT": "Austria",
    "AU": "Australia",
    "AW": "Aruba",
    "AX": "Åland Islands",
    "AZ": "Azerbaijan",
    "BA": "Bosnia and Herzegovina",
    "BB": "Barbados",
    "BD": "Bangladesh",
    "BE": "Belgium",
    "BF": "Burkina Faso",
    "BG": "Bulgaria",
    "BH": "Bahrain",
    "BI": "Burundi",
    "BJ": "Benin",
    "BL": "Saint Barthélemy",
    "BM": "Bermuda",
    "BN": "Brunei",
    "BO": "Bolivia",
    "BQ": "Caribbean Netherlands",
    "BR": "Brazil",
    "BS": "Bahamas",
    "BT": "Bhutan",
    "BW": "Botswana",
    "BY": "Belarus",
    "BZ": "Belize",
    "CA": "Canada",
    "CC": "Cocos (Keeling) Islands",
    "CD": "Democratic Republic of the Congo",
    "CF": "Central African Republic",
    "CG": "Republic of the Congo",
    "CH": "Switzerland",
    "CI": "Ivory Coast",
    "CK": "Cook Islands",
    "CL": "Chile",
    "CM": "Cameroon",
    "CN": "China",
    "CO": "Colombia",
    "CR": "Costa Rica",
    "CU": "Cuba",
    "CV": "Cape Verde",
    "CW": "Curaçao",
    "CX": "Christmas Island",
    "CY": "Cyprus",
    "CZ": "Czech Republic",
    "DE": "Germany",
    "DJ": "Djibouti",
    "DK": "Denmark",
    "DM": "Dominica",
    "DO": "Dominican Republic",
    "DZ": "Algeria",
    "EC": "Ecuador",
    "EE": "Estonia",
    "EG": "Egypt",
    "EH": "Western Sahara",
    "ER": "Eritrea",
    "ES": "Spain",
    "ET": "Ethiopia",
    "FI": "Finland",
    "FJ": "Fiji",
    "FK": "Falkland Islands",
    "FM": "Micronesia",
    "FO": "Faroe Islands",
    "FR": "France",
    "GA": "Gabon",
    "GB": "United Kingdom",
    "GD": "Grenada",
    "GE": "Georgia",
    "GF": "French Guiana",
    "GG": "Guernsey",
    "GH": "Ghana",
    "GI": "Gibraltar",
    "GL": "Greenland",
    "GM": "Gambia",
    "GN": "Guinea",
    "GP": "Guadeloupe",
    "GQ": "Equatorial Guinea",
    "GR": "Greece",
    "GT": "Guatemala",
    "GU": "Guam",
    "GW": "Guinea-Bissau",
    "GY": "Guyana",
    "HK": "Hong Kong",
    "HN": "Honduras",
    "HR": "Croatia",
    "HT": "Haiti",
    "HU": "Hungary",
    "ID": "Indonesia",
    "IE": "Ireland",
    "IL": "Israel",
    "IM": "Isle of Man",
    "IN": "India",
    "IO": "British Indian Ocean Territory",
    "IQ": "Iraq",
    "IR": "Iran",
    "IS": "Iceland",
    "IT": "Italy",
    "JE": "Jersey",
    "JM": "Jamaica",
    "JO": "Jordan",
    "JP": "Japan",
    "KE": "Kenya",
    "KG": "Kyrgyzstan",
    "KH": "Cambodia",
    "KI": "Kiribati",
    "KM": "Comoros",
    "KN": "Saint Kitts and Nevis",
    "KP": "North Korea",
    "KR": "South Korea",
    "KW": "Kuwait",
    "KY": "Cayman Islands",
    "KZ": "Kazakhstan",
    "LA": "Laos",
    "LB": "Lebanon",
    "LC": "Saint Lucia",
    "LI": "Liechtenstein",
    "LK": "Sri Lanka",
    "LR": "Liberia",
    "LS": "Lesotho",
    "LT": "Lithuania",
    "LU": "Luxembourg",
    "LV": "Latvia",
    "LY": "Libya",
    "MA": "Morocco",
    "MC": "Monaco",
    "MD": "Moldova",
    "ME": "Montenegro",
    "MF": "Saint Martin",
    "MG": "Madagascar",
    "MH": "Marshall Islands",
    "MK": "North Macedonia",
    "ML": "Mali",
    "MM": "Myanmar",
    "MN": "Mongolia",
    "MO": "Macau",
    "MP": "Northern Mariana Islands",
    "MQ": "Martinique",
    "MR": "Mauritania",
    "MS": "Montserrat",
    "MT": "Malta",
    "MU": "Mauritius",
    "MV": "Maldives",
    "MW": "Malawi",
    "MX": "Mexico",
    "MY": "Malaysia",
    "MZ": "Mozambique",
    "NA": "Nambia",
    "NC": "New Caledonia",
    "NE": "Niger",
    "NF": "Norfolk Island",
    "NG": "Nigeria",
    "NI": "Nicaragua",
    "NL": "Netherlands",
    "NO": "Norway",
    "NP": "Nepal",
    "NR": "Nauru",
    "NU": "Niue",
    "NZ": "New Zealand",
    "OM": "Oman",
    "PA": "Panama",
    "PE": "Peru",
    "PF": "French Polynesia",
    "PG": "Papua New Guinea",
    "PH": "Philippines",
    "PK": "Pakistan",
    "PL": "Poland",
    "PM": "Saint Pierre and Miquelon",
    "PR": "Puerto Rico",
    "PS": "Palestine",
    "PT": "Portugal",
    "PW": "Palau",
    "PY": "Paraguay",
    "QA": "Qatar",
    "RE": "Réunion",
    "RO": "Romanian",
    "RS": "Serbia",
    "RU": "Russia",
    "RW": "Rwanda",
    "SA": "Saudi Arabia",
    "SB": "Solomon Islands",
    "SC": "Seychelles",
    "SD": "Sudan",
    "SE": "Sweden",
    "SG": "Singapore",
    "SH": "Saint Helena",
    "SI": "Slovenia",
    "SJ": "Svalbard and Jan Mayen",
    "SK": "Slovakia",
    "SL": "Sierra Leone",
    "SM": "San Marino",
    "SN": "Senegal",
    "SO": "Somalia",
    "SR": "Suriname",
    "SS": "South Sudan",
    "ST": "São Tomé and Príncipe",
    "SV": "El Salvador",
    "SX": "Sint Maarten",
    "SY": "Syria",
    "SZ": "Eswatini",
    "TA": "Tristan da Cunha",
    "TC": "Turks and Caicos Islands",
    "TD": "Chad",
    "TG": "Togo",
    "TH": "Thailand",
    "TJ": "Tajikistan",
    "TK": "Tokelau",
    "TL": "Timor-Leste",
    "TM": "Turkmenistan",
    "TN": "Tunisia",
    "TO": "Tonga",
    "TR": "Turkey",
    "TT": "Trinidad and Tobago",
    "TV": "Tuvalu",
    "TW": "Taiwan",
    "TZ": "Tanzania",
    "UA": "Ukraine",
    "UG": "Uganda",
    "US": "United States",
    "UY": "Uruguay",
    "UZ": "Uzbekistan",
    "VA": "Vatican City",
    "VC": "Saint Vincent and the Grenadines",
    "VE": "Venezuela",
    "VG": "British Virgin Islands",
    "VI": "U.S. Virgin Islands",
    "VN": "Vietnam",
    "VU": "Vanuatu",
    "WF": "Wallis and Futuna",
    "WS": "Samoa",
    "XK": "Kosovo",
    "YE": "Yemen",
    "YT": "Mayotte",
    "ZA": "South Africa",
    "ZM": "Zambia",
    "ZW": "Zimbabwe"
  };
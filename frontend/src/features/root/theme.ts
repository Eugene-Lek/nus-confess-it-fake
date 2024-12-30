import { createTheme } from "@mui/material";

const defaultTheme = createTheme()
export const Theme = createTheme({
    palette: {
        darkBrown: defaultTheme.palette.augmentColor({
            color: {
                main: "#51361a"
            },
            name: "darkBrown"
        }), 
        orange: defaultTheme.palette.augmentColor({
            color: {
                main: "#F3A953"
            }
        }),
        lightBrown: defaultTheme.palette.augmentColor({
            color: {
                main: "#946846"
            }
        }),
        offWhite: defaultTheme.palette.augmentColor({
            color: {
                main: "#F2F3F3"
            }
        }),
    },
});


// Augment the palette to include this palette
declare module '@mui/material/styles' {
    interface Palette {
        darkBrown?: Palette["primary"];
        orange: Palette["primary"];
        lightBrown: Palette["primary"];
        offWhite: Palette["primary"];
    }
    interface PaletteOptions {
        darkBrown?: PaletteOptions["primary"];
        orange: PaletteOptions["primary"];
        lightBrown: PaletteOptions["primary"];
        offWhite: PaletteOptions["primary"];
    }
}

// Update the Button's color options to include these options
declare module '@mui/material/Button' {
    interface ButtonPropsColorOverrides {
        darkBrown: true, 
        orange: true,
        lightBrown: true,
        offWhite: true,
    }
  }

declare module '@mui/material/Typography' {
    interface TypographyPropsColorOverrides {
        darkBrown: true, 
        orange: true,
        lightBrown: true,
        offWhite: true,
    }
  }

declare module '@mui/material' {
    interface SvgIconPropsColorOverrides {
        darkBrown: true, 
        orange: true,
        lightBrown: true,
        offWhite: true,
    }
  }


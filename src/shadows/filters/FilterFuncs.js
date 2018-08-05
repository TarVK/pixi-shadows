// Some functions to map a value as a color
export const filterFuncs = `
float colorToFloat(vec4 color){
    return (color.r + (color.g + color.b * 256.0) * 256.0) * 255.0 - 8388608.0;
}
vec4 floatToColor(float f){
    f += 8388608.0;
    vec4 color;
    color.a = 255.0;
    color.b = floor(f / 256.0 / 256.0);
    color.g = floor((f - color.b * 256.0 * 256.0) / 256.0);
    color.r = floor(f - color.b * 256.0 * 256.0 - color.g * 256.0);
    return color / 255.0;
}
`;
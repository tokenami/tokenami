// import { ESLint } from 'eslint';

// async function lintFiles(cwd: string, include: string[]) {
//   const eslint = new ESLint({
//     cwd,
//     errorOnUnmatchedPattern: false,
//     ignore: false,
//     allowInlineConfig: false,
//     useEslintrc: false,
//     overrideConfig: {
//       root: true,
//       plugins: ['tokenami'],
//     },
//   });

//   const results = await eslint.lintFiles(include);

//   const formatter = await eslint.loadFormatter('stylish');
//   const resultText = formatter.format(results);

//   console.log(resultText);
// }

// /* ---------------------------------------------------------------------------------------------- */

// export { lintFiles };

import fs from 'fs';

const textToInsert = [
    'fourth change',
    'fifth change',
    'sixth change',
]

var data = fs.readFileSync('./example.md').toString().split("\n");

data.splice(2, 0, '## NEXT VERSION\n');
data.splice(3, 0, '### CHANGES\n');

textToInsert.map((text, index) => {
    if (index === textToInsert.length - 1) {
        data.splice(4 + index, 0, `- ${text}\n`);
    } else {
        data.splice(4 + index, 0, `- ${text}`);
    }
})

var editedText = data.join("\n");

console.log('editedText:', editedText);

fs.writeFile('./example.md', editedText, function (err) {
  if (err) return err;
});

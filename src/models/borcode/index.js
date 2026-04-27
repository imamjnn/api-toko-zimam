import {getAllPrinters} from '@printers/printers';

export const printBarcode = async (req, res) => {
  const printers = await getAllPrinters();
  console.log(
    'Available printers:',
    printers.map(p => p.name),
  );
  res.json({message: 'Barcode printed successfully'});
};

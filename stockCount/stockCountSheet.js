let data = `CHICKEN MINI FILLET: 11.00|4.00|37.00
CHICKEN ORIGINAL (Pieces): 13.00|0.00|16.00
FRIES 11X11: 24.00|4.33|0.00
CHICKEN HOTWINGS ISP: 10.00|0.00|8.00
CHICKEN POPCORN: 5.00|4.00|45.00
CHICKEN FROZEN - (Heads): 6.00|0.00|0.00
CHICKEN FILLETS: 3.00|5.00|16.00
CHICKEN ZINGER ISP: 3.00|5.00|6.00
CHICKEN OR FILLET BITES FTF: 2.00|1.00|26.00
VEGAN FILLET: 1.00|2.00|9.00`;

data = data.split("\n").filter(el => el.length > 1);
let products = {};

        for (let entry of data) {
            let [name, stockLevel] = entry.split(": ");
            if (stockLevel.includes("|")) {
                stockLevel = stockLevel.trim().split("|");
                let [box, inner, pieces] = stockLevel.map(Number);
                products[name] = {
                    box,
                    inner,
                    pieces
                }
            } else if (stockLevel.includes("#")) {
                stockLevel = Number(stockLevel.slice(1))
                products[name] = {
                    box: 0,
                    inner: 0,
                    pieces: stockLevel
                };
            }
        }

        let table = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>

    .main__div {
        display:flex;
        position:relative;
        align-items: center;
        justify-content: center;
        width:100%;
        height:100px;
    }

    @media print {
        .main__div {
            display: none;
        }
    }
    table {
        display: inline-block;
        width:684px;
        Z-INDEX: 101;
        LEFT: 8px;
        POSITION: absolute;
        TOP: 11px"
    }

    td {
        height:30px
    }

    th__product {
        width: 140px;
    }

    th__box {
        width: 45px;
    }

    
        .product {
            border: 1px solid black;
        }

        .box {
            border: 1px solid black;
            width: 45px;
            background-color:rgba(200,200,200,0.6);
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            border-right-style: dotted;
        }

        .write__box {
            border: 1px solid black;
            border-left-style: dotted ;
            width: 45px;
        }
        .print-button {
            position: fixed;
            width:100px;
        }

        @media print {
            .print-button {
                display: none;
            }
        }
    </style>
</head>
<body>

<div class="main__div">
<button class="print-button" onclick="window.print()">Print</button>
</div>
    <table>
    <thead>
    <tr>
    <th class="th__product">Product</th>
    <th class="th__box" colspan="2">Box</th>
    <th class="th__box" colspan="2">Inner</th>
    <th class="th__box" colspan="2">Pieces</th>
    </tr>
    </thead>
    <tbody>`;

        let sorted = Object.keys(products).sort((a, b) => a.localeCompare(b))
        for (let product of sorted) {
            table += `<tr>
            <td class="product">${product}</td>
            <td class="box">${products[product].box}</td><td class="write__box"></td>
            <td class="box">${products[product].inner}</td><td class="write__box"></td>
            <td class="box">${products[product].pieces}</td><td class="write__box"></td>
            <td><input type="checkbox"></td>\n`
        }



        table += ` </tbody>
        </table>
        </body>
        </html>
       `
        console.log(table);
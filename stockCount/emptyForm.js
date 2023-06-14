let tableRows = document.querySelectorAll(`#ctl00_ph_dgSC_ctl00 tbody tr`)

            for (let row of tableRows) {
                let valueBoxElement = row.cells[3]
                let valueInnerElement = row.cells[4]
                let valuePiecesElement = row.cells[5];
                let checkBox = row.cells[6].childNodes[1].childNodes[0]
                    
                    
                valueBoxElement.firstElementChild.value = "0.00";
                valueInnerElement.firstElementChild.value = "0.00";
                valuePiecesElement.firstElementChild.value = "0.00";
                if (checkBox.checked) {
                    checkBox.click()
                }
            }

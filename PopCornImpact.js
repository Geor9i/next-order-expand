function popImpact (volumeFreshPop,holdTime,overPortion,theoreticalUsage) {
    
    // CONVERT VALUES 

    holdTime *= 60 // To Seconds
    overPortion /= 100 // to Decimal
    theoreticalUsage *= 1000 // To grams
    let flag = ["Small", "Regular", "Large"]
    let smallCount = 10
    let regularCount = 21
    let largeCount = 34
    let frozenPop = volumeFreshPop * 1.25
    let popWeight = 6.7567567568;
    let priceBoxPopcorn = 69.39; //£  14 bags 
    let priceBagPopcorn = 4.9564285714; //£  // 148 piece in each
    let popPrice = 0.0334893822; //£
    let totalPieces = theoreticalUsage / popWeight
    let InitialPrice = totalPieces * popPrice
    let smallBoxesShare = totalPieces * 0.3403;
    let regularBoxesShare = totalPieces * 0.12;
    let largeBoxesShare = totalPieces * 0.539574;
    let reductionPerSec = 0.0104166666666667
    let allowNonShrinkTimer = 5 * 60 //No volume reduction allowence time (converted to seconds)
    let maxAllowedVolumeReduction = 4
    let currVol = Math.max((volumeFreshPop -  volumeFreshPop * ((reductionPerSec * (Math.max(holdTime -  allowNonShrinkTimer, 0))) / 100)), maxAllowedVolumeReduction)
    let smallSold = smallBoxesShare / smallCount
    let smallCost = smallBoxesShare * popPrice
    let smallBoxVolume = frozenPop * smallCount
    let smallBoxCookedVolume = volumeFreshPop * smallCount

    let regularSold = regularBoxesShare / regularCount
    let regularCost = regularBoxesShare * popPrice
    let regularBoxVolume = frozenPop * regularCount
    let regularBoxCookedVolume = volumeFreshPop * regularCount

    let largeSold = largeBoxesShare / largeCount
    let largeCost = largeBoxesShare * popPrice
    let largeBoxVolume = frozenPop * largeCount
    let largeBoxCookedVolume = volumeFreshPop * largeCount

    let prep = (volumeFreshPop, overPortion, totalBoxVolume, cookVolume, type) => {
        volumeFreshPop = currVol;
        let currentBoxCount = (cookVolume / volumeFreshPop) 
        overPortion = (currentBoxCount * overPortion)
        if ((currentBoxCount + overPortion) * volumeFreshPop <= totalBoxVolume){
            currentBoxCount += overPortion
            return currentBoxCount 
        } else if((currentBoxCount + overPortion) * volumeFreshPop > totalBoxVolume){
        
            let currentBoxVolume = totalBoxVolume / volumeFreshPop
            console.log(`Box Limit Reached !\n${type} popcorn count: ${Math.round(currentBoxVolume)}\n`);
            return currentBoxVolume
        } 
    }

    //--------------------------------------------------------------------------
    //                    C O U N T E R S 


    let smallCurrCount = prep(volumeFreshPop, overPortion, smallBoxVolume, smallBoxCookedVolume, flag[0])
    let smallDeviation = Math.abs(smallCurrCount - smallCount).toFixed(1)

    let regularCurrCount = prep(volumeFreshPop, overPortion, regularBoxVolume, regularBoxCookedVolume, flag[1])
    let regularDeviation = Math.abs(regularCurrCount - regularCount).toFixed(1)

    let largeCurrCount = prep(volumeFreshPop, overPortion, largeBoxVolume, largeBoxCookedVolume, flag[2])

    let largeDeviation = (Math.abs(largeCurrCount - largeCount)).toFixed(1)
    

    let totalExtraPieces = (smallSold * smallDeviation) + (regularSold * regularDeviation) + (largeSold * largeDeviation)

    //---------------------------------------
                //REPORT SHEET\\



    console.log(`Excess Pieces: ${Math.round(totalExtraPieces)}` + " ".repeat(12) + `As Bags: ${Math.round(totalExtraPieces /148)}` + " ".repeat(20) + `As Boxes: ${((totalExtraPieces /148) / 14).toFixed(2)}`);
    console.log("\n" + (" ").repeat(31) + "Usage in KG" + (" ").repeat(30));
    console.log((" ").repeat(2) + "/" + ("=").repeat(75) + "\\" +  (" ").repeat(20) + "\n");
    console.log((" ").repeat(2) + "Theoretical:" + (" ").repeat(52) +  "Actual:");
    console.log((" ").repeat(1) + ("-").repeat(14) + (" ").repeat(49) +  ("-").repeat(10));
    console.log((" ").repeat(3) + `${(theoreticalUsage / 1000).toFixed(2)} kg` + (" ").repeat(54) + `${(((totalExtraPieces * popWeight) / 1000) + theoreticalUsage / 1000).toFixed(2)} kg`);
    console.log((" ").repeat(32) + " Cost £" + (" ").repeat(30));
    console.log((" ").repeat(2) + "/" + ("=").repeat(75)  + "\\" + (" ").repeat(30));
    console.log((" ").repeat(2) + "Theoretical:" + (" ").repeat(17) +  "Calculated:" + (" ").repeat(20) + "Usage Dependent:");
    console.log((" ").repeat(1) + ("-").repeat(14) + (" ").repeat(14) +  ("-").repeat(14) + (" ").repeat(17) + ("-").repeat(19));
    console.log((" ").repeat(5) + `£${InitialPrice.toFixed(2)}` + (" ").repeat(19) +  `£${(InitialPrice + (totalExtraPieces * popPrice)).toFixed(2)}` + (" ").repeat(26) + `£${(totalExtraPieces * popPrice).toFixed(2)}` + "\n");
    console.log("\n"+(" ").repeat(27) + "Portion Size Shares:" + (" ").repeat(30));
    console.log((" ").repeat(2) + "/" + ("=").repeat(75) + "\\" + (" ").repeat(30));
    console.log((" ").repeat(2) + "By Size:" + (" ").repeat(15) +  "Theoretical Cost + Usage:" + (" ").repeat(13) + "Piece deviation:");
    console.log((" ").repeat(1) + ("-").repeat(10) + (" ").repeat(12) +  ("-").repeat(29) + (" ").repeat(9) + ("-").repeat(19) + "\n");
    console.log((" ").repeat(2) + "Small:" + `   ${Math.round(smallSold)}` + (" ").repeat(16) +  `£${smallCost.toFixed(2)} + £${(smallDeviation * popPrice).toFixed(2)}` + (" ").repeat(21) + `Small:   ${smallDeviation}`);
    console.log((" ").repeat(2) + "Regular:" + ` ${Math.round(regularSold)}` + (" ").repeat(16) +  `£${regularCost.toFixed(2)} + £${(regularDeviation * popPrice).toFixed(2)}` + (" ").repeat(22) + `Regular: ${regularDeviation}`);
    console.log((" ").repeat(2) + "Large:" + `   ${Math.round(largeSold)}` + (" ").repeat(16) +  `£${largeCost.toFixed(2)} + £${(largeDeviation * popPrice).toFixed(2)}` + (" ").repeat(21) + `Large:   ${largeDeviation}`);
    console.log((" ").repeat(1) + ("-").repeat(14) + (" ").repeat(12) + ("-").repeat(8) +  ("-").repeat(10) + (" ").repeat(16) +  ("-").repeat(16));
    console.log("\n"+(" ").repeat(27) + "Popcorn State Chart:" + (" ").repeat(30));
    console.log((" ").repeat(2) + "/" + ("=").repeat(75) + "\\" + (" ").repeat(30));
    console.log((" ").repeat(24) + "Avg. Volume Per Piece:" + (" ").repeat(30) + "\n");
    console.log((" ").repeat(2) + "Frozen:" + (" ").repeat(24) +  "Cooked:" + (" ").repeat(21) + `Held for ${holdTime / 60} minutes:`);
    console.log((" ").repeat(2) + ("-").repeat(8) + (" ").repeat(22) +  ("-").repeat(9) + (" ").repeat(18) + ("-").repeat(24));
    console.log((" ").repeat(3) + `${frozenPop.toFixed(2)} cm3` + (" ").repeat(20) +  `${volumeFreshPop.toFixed(2)} cm3` + (" ").repeat(27) + `${currVol.toFixed(2)} cm3`);
    console.log("\n\n" + (" ").repeat(23) + "Volume Reduction Per Piece:" + (" ").repeat(30));
    console.log((" ").repeat(32) + `${(((volumeFreshPop - currVol) / volumeFreshPop)*100).toFixed(2)}%` + (" ").repeat(30));

}

popImpact(
8.9, // Popcorn volume per piece in cm3
15, //  Hold Time in minutes
0,  // Over-portioning as percentage
94.02  // Theoretical Usage in Kg
)
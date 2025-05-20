const calculateFee = (cardPrice, chipFee, cardFee, bniFee, mddFee, marketingFeePercent) => {
    const afterBNI = cardPrice - chipFee - cardFee - bniFee;
    console.log(`After BNI Fee Deduction: ${afterBNI}`);

    const after3Percent = afterBNI - (0.03 * afterBNI);
    console.log(`After 3% Deduction: ${after3Percent}`);

    const afterMDD = after3Percent - mddFee;
    console.log(`After MDD Fee Deduction: ${afterMDD}`);

    const after5PercentMDD = afterMDD - (0.5 * mddFee) * 0.05;
    console.log(`After 5% of Half MDD Fee Deduction: ${after5PercentMDD}`);

    const afterMarketing = marketingFeePercent / 100 * after5PercentMDD;
    console.log(`Marketing Fee: ${afterMarketing}`);
    
    const finalFee = afterMarketing - (0.5 * afterMarketing) * 0.05;
    console.log(`After 5% of Half Marketing Fee Deduction (Final Fee): ${finalFee}`);

    return finalFee;
};

// Example values:
const cardPrice = 20721;
const chipFee = 5600;
const cardFee = 3200;
const bniFee = 7200;
const mddFee = 750;
const marketingFeePercent = 20;

const fee = calculateFee(cardPrice, chipFee, cardFee, bniFee, mddFee, marketingFeePercent);
console.log(`Final Calculated Fee: ${fee}`);

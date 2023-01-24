pragma circom 2.0.0;

template YesBinaryCount () {
    signal input vote; // Users vote in binary
    signal output out; // Output of the circuit
    var number=0; // Counter
    
    // Counting how many bits does a String has
    for (var i = 0; i < vote; i++) {
        number+=1;
    }
    out <-- number; // Assigning counter to output
    out === 21; // Constraint: Yes string should have 21 bits
}

component main = YesBinaryCount();
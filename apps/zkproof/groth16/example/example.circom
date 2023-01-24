pragma circom 2.0.0;

/*This circuit template checks that c is the multiplication of a and b.*/  

template Example () {  
   // Declaration of signals.  
   signal input a; //Public value.  
   signal input b; //Private value.
   signal input c; //Public value.  
   signal d; //Intermediate signal.
   signal output out; //Output of the signal.

   // The logic or a ‘constraint’ which a private signal has to satisfy.
   d <== a * b;
   out <== c + d;
   out === 18;  
}

component main { public [ a, c ] } = Example();
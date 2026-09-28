// TEMPLATE (package-modernize): a fresh consumer of the packed or published package, run by run.sh in every dependency
// set, on net10.0 and net48. Call the package through its public API only, check a few answers that need no network, print
// what run.sh's expected() checks (for example the versions of dependencies the consumer actually loaded), and return 0
// only when every answer is right. The CachingServiceWithAOPSupport 2.0.0 version registers an Autofac component with
// [Cache] methods and prints the Autofac, DynamicProxy and Castle.Core versions it loaded.

using System;

public static class Program
{
    public static int Main()
    {
        // TEMPLATE: calls into {{PACKAGE_ID}} with known answers.
        var ok = true;

        // TEMPLATE: print what run.sh's expected() looks for, for example:
        // Console.WriteLine("SomeDependency " + typeof(SomeDependency.SomeType).Assembly.GetName().Version);
        Console.WriteLine(ok ? "consumer answers as expected" : "wrong answer");
        return ok ? 0 : 1;
    }
}

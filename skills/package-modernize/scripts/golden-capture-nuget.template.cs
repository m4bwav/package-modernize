// TEMPLATE (package-modernize): records what the PUBLISHED old version of a NuGet package returns, so the new major can prove
// what it kept and list what it changed. First used on TrailerClipper 1.1.0 (2026-09-27; its tests/Golden/Capture/Program.cs is
// a worked example with filesystem fixtures, console capture and ffprobe measurements). If the old package is a .NET Framework
// assembly that needs a Framework-only reference (System.Web.Extensions and the like), target net48 instead of net10.0 and add
// Microsoft.NETFramework.ReferenceAssemblies (PrivateAssets all) and System.Text.Json; top-level records then need IsExternalInit,
// so plain classes are simpler.
//
// Run it in a scratch console project, never inside the repository, before any code change:
//   dotnet new console -n Capture -f net10.0 && cd Capture
//   dotnet add package {{PACKAGE_ID}} --version {{OLD_VERSION}}
//   copy this file over Program.cs, fill the cases, then: dotnet run > {{OLD_VERSION}}.json
// Commit the JSON and this file (as run) under tests/Golden/. The new test project reads the JSON and asserts equality.
//
// JSON cannot hold an exception, so a throwing call records {"$throws": "ExceptionType: message"}.
// Record every dependency version the scratch project resolved (obj/project.assets.json) in the header.

using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Text.Json.Serialization;

var cases = new List<Case>();

// TEMPLATE: every public method, several argument shapes, and the odd inputs the old version accepted:
// null, empty strings, whitespace, negative and out-of-range numbers, very large inputs, invalid JSON or malformed input,
// culture-sensitive values (run once under InvariantCulture and once under a comma-decimal culture such as de-DE).
// Example for a static string-to-string method:
// Add("PrettyPrint", new object?[] { "{\"a\":1}" }, () => {{PROJECT}}.SomeType.PrettyPrint("{\"a\":1}"));

void Add(string method, object?[] args, Func<object?> call)
{
    object? result;
    try
    {
        result = call();
    }
    catch (Exception e)
    {
        result = new Dictionary<string, string> { ["$throws"] = e.GetType().Name + ": " + e.Message };
    }
    cases.Add(new Case(method, args, result));
}

var header = new Header(
    Package: "{{PACKAGE_ID}}@{{OLD_VERSION}}",
    Runtime: System.Runtime.InteropServices.RuntimeInformation.FrameworkDescription,
    Culture: System.Globalization.CultureInfo.CurrentCulture.Name,
    Captured: DateTime.UtcNow.ToString("yyyy-MM-dd"),
    Dependencies: new Dictionary<string, string>(), // TEMPLATE: from obj/project.assets.json
    Note: "Golden outputs of the published {{OLD_VERSION}}; see tests/Golden/Capture.cs for the format.",
    Cases: cases);

var options = new JsonSerializerOptions { WriteIndented = true, Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping, DefaultIgnoreCondition = JsonIgnoreCondition.Never };
Console.Out.Write(JsonSerializer.Serialize(header, options));

record Case(string Method, object?[] Args, object? Result);
record Header(string Package, string Runtime, string Culture, string Captured, Dictionary<string, string> Dependencies, string Note, List<Case> Cases);

using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinanceAI.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddBankConnections : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "InsitutionName",
                table: "BankConnections",
                newName: "InstitutionName");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "InstitutionName",
                table: "BankConnections",
                newName: "InsitutionName");
        }
    }
}

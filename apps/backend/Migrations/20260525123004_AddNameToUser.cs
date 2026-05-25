using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinanceAI.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddNameToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PlaidConnections_Users_UserId",
                table: "PlaidConnections");

            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_PlaidConnections_PlaidConnectionId",
                table: "Transactions");

            migrationBuilder.DropPrimaryKey(
                name: "PK_PlaidConnections",
                table: "PlaidConnections");

            migrationBuilder.RenameTable(
                name: "PlaidConnections",
                newName: "PlaidConnections");

            migrationBuilder.RenameIndex(
                name: "IX_PlaidConnections_UserId",
                table: "PlaidConnections",
                newName: "IX_PlaidConnections_UserId");

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "Users",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddPrimaryKey(
                name: "PK_PlaidConnections",
                table: "PlaidConnections",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_PlaidConnections_Users_UserId",
                table: "PlaidConnections",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_PlaidConnections_PlaidConnectionId",
                table: "Transactions",
                column: "PlaidConnectionId",
                principalTable: "PlaidConnections",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PlaidConnections_Users_UserId",
                table: "PlaidConnections");

            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_PlaidConnections_PlaidConnectionId",
                table: "Transactions");

            migrationBuilder.DropPrimaryKey(
                name: "PK_PlaidConnections",
                table: "PlaidConnections");

            migrationBuilder.DropColumn(
                name: "Name",
                table: "Users");

            migrationBuilder.RenameTable(
                name: "PlaidConnections",
                newName: "PlaidConnections");

            migrationBuilder.RenameIndex(
                name: "IX_PlaidConnections_UserId",
                table: "PlaidConnections",
                newName: "IX_PlaidConnections_UserId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_PlaidConnections",
                table: "PlaidConnections",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_PlaidConnections_Users_UserId",
                table: "PlaidConnections",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_PlaidConnections_PlaidConnectionId",
                table: "Transactions",
                column: "PlaidConnectionId",
                principalTable: "PaidConnections",
                principalColumn: "Id");
        }
    }
}

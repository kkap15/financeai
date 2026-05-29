using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinanceAI.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddBankConnection : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "PlaidId",
                table: "Transactions",
                newName: "ExternalId");

            migrationBuilder.AddColumn<Guid>(
                name: "BankConnectionId",
                table: "Transactions",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "BankConnections",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Provider = table.Column<string>(type: "text", nullable: false),
                    AccessToken = table.Column<string>(type: "text", nullable: true),
                    ItemId = table.Column<string>(type: "text", nullable: true),
                    BasiqUserId = table.Column<string>(type: "text", nullable: true),
                    InsitutionName = table.Column<string>(type: "text", nullable: false),
                    LastSynced = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BankConnections", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BankConnections_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_BankConnectionId",
                table: "Transactions",
                column: "BankConnectionId");

            migrationBuilder.CreateIndex(
                name: "IX_BankConnections_UserId",
                table: "BankConnections",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_BankConnections_BankConnectionId",
                table: "Transactions",
                column: "BankConnectionId",
                principalTable: "BankConnections",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_BankConnections_BankConnectionId",
                table: "Transactions");

            migrationBuilder.DropTable(
                name: "BankConnections");

            migrationBuilder.DropIndex(
                name: "IX_Transactions_BankConnectionId",
                table: "Transactions");

            migrationBuilder.DropColumn(
                name: "BankConnectionId",
                table: "Transactions");

            migrationBuilder.RenameColumn(
                name: "ExternalId",
                table: "Transactions",
                newName: "PlaidId");
        }
    }
}
